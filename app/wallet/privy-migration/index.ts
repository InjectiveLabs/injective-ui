import { concatBytes } from 'viem'
import { GeneralException } from '@injectivelabs/exceptions'
import { Wallet, TurnkeyProvider } from '@injectivelabs/wallet-base'
import {
  findPrivyWallet,
  getPrivySessionUser,
  getPrivyAccessToken
} from '../privy/client'
import {
  completePrivyMigration,
  fetchPrivyMigrationStatus
} from '../../service/app/privyMigration'
import {
  PRIVY_APP_ID,
  PRIVY_CLIENT_ID,
  TURNKEY_HPKE_INFO,
  PRIVY_AUTH_API_URL
} from '../../utils/constant'
import {
  toUtf8,
  hexToBase64,
  removeHexPrefix,
  uint8ArrayToHex,
  hexToUint8Array,
  base64ToUint8Array,
  uint8ArrayToBase64
} from '@injectivelabs/sdk-ts/utils'
import { getWalletStrategy, TURNKEY_API_SERVER_ENDPOINT } from '../strategy'
import type {
  TurnkeyWallet,
  TurnkeyWalletStrategy
} from '@injectivelabs/wallet-turnkey'
import type { PrivyUser } from '../privy/client'
import type {
  SignInMethod,
  PrivyMigrationStatus
} from '../../service/app/privyMigration'

// Moves Turnkey keys into Privy. Only migration: the Privy wallet itself is
// handled by ../privy. Delete once every account has moved.

export type SignInContact = { email?: string; phone?: string }

/** The contact of a Turnkey account, and whether it signs in with Google */
export type TurnkeyAccountContact = { isGoogle?: boolean } & SignInContact

/** Which Privy wallet to use: the one with this address, or a new one */
export type MigrationResult =
  | { type: 'new_user' }
  /** No Turnkey account: the Privy user needs a new wallet */
  | { type: 'ready'; address?: string }

/**
 * Asks the person for the code Turnkey sent, and resolves with what they typed.
 * `error` is why their last code failed; `resend` sends a new one.
 */
export type AskCode = (request: {
  error?: unknown
  resend: () => Promise<void>
}) => Promise<string>

type KeyMove = { address: string; subOrgId: string; privyUserId: string }

export const SIGN_IN_ACCOUNT_ERROR = 'sign-in-account'

/** A GeneralException, so the app's error handler shows it. */
export class SignInAccountError extends GeneralException {
  constructor(message: string) {
    super(new Error(message), { context: SIGN_IN_ACCOUNT_ERROR })
  }
}

/** Second-code methods this layer signs in with (it has no phone sign-in). */
const SIGN_IN_CODE_METHODS = ['email']
const USE_PREVIOUS_SIGN_IN =
  'Sign in with the email you used before, or contact support.'
const PHONE_SIGN_IN_UNAVAILABLE =
  "This account signs in with a phone number, which isn't available here. Please contact support."
const SIGN_IN_METHOD_LABELS: Record<SignInMethod, string> = {
  sms: 'phone',
  email: 'email',
  apple: 'Apple',
  google: 'Google'
}
const SIGN_IN_METHOD_NOUNS: Record<SignInMethod, string> = {
  email: 'email',
  sms: 'phone number',
  apple: 'Apple account',
  google: 'Google account'
}

async function getTurnkeyWallet() {
  const walletStrategy = await getWalletStrategy()
  const strategy = (await walletStrategy.loadStrategy(Wallet.Turnkey)) as
    | undefined
    | TurnkeyWalletStrategy

  if (!strategy) {
    throw new Error('Turnkey is not configured')
  }

  return {
    strategy,
    turnkeyWallet: await strategy.getWalletClient<TurnkeyWallet>()
  }
}

/** The contact of the Turnkey session in this browser, or null without one */
export async function getTurnkeySessionContact(): Promise<null | TurnkeyAccountContact> {
  try {
    const { turnkeyWallet } = await getTurnkeyWallet()
    const { session } = await turnkeyWallet.getSession()

    if (!session) {
      return null
    }

    const client = await turnkeyWallet.getIndexedDbClient()
    const { userId, organizationId } = await client.getWhoami()
    const { user } = await client.getUser({ userId, organizationId })
    const isGoogle = user.oauthProviders.some(({ issuer }) =>
      issuer.includes('accounts.google.com')
    )

    if (user.userEmail) {
      return { isGoogle, email: user.userEmail }
    }

    if (user.userPhoneNumber) {
      return { phone: user.userPhoneNumber }
    }

    return isGoogle ? { isGoogle } : null
  } catch {
    return null
  }
}

/** The sub-org of a Turnkey session already in this browser, or null. Never prompts. */
export async function connectTurnkey(): Promise<null | string> {
  try {
    const { turnkeyWallet } = await getTurnkeyWallet()
    const { session, organizationId } = await turnkeyWallet.getSession()

    return session && organizationId ? organizationId : null
  } catch {
    return null
  }
}

// Same masks as ui-api's hints
const MASK = '•••'
const maskEmail = (email: string) => {
  const at = email.lastIndexOf('@')
  const local = email.slice(0, at)
  const last = local.length > 1 ? local[local.length - 1] : ''

  return at <= 0 ? MASK : `${local[0]}${MASK}${last}@${email.slice(at + 1)}`
}
const maskPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '')

  return digits.length >= 4 ? `•••• ${digits.slice(-4)}` : '••••'
}

// Only the account's own contact: ui-api's code route signs up unknown ones
function getTurnkeyCodeContact(
  turnkey: {
    emailHint: null | string
    phoneHint: null | string
    reverifyMethods: string[]
  },
  contact: SignInContact
): null | SignInContact {
  const email = contact.email?.trim().toLowerCase()

  if (
    email &&
    turnkey.reverifyMethods.includes('email') &&
    maskEmail(email) === turnkey.emailHint?.toLowerCase()
  ) {
    return { email }
  }

  if (
    contact.phone &&
    turnkey.reverifyMethods.includes('sms') &&
    maskPhone(contact.phone) === turnkey.phoneHint
  ) {
    return { phone: contact.phone }
  }

  return null
}

const DIFFERENT_ACCOUNT =
  'This sign-in belongs to a different account. Please contact support.'

// ui-api's code for a contact or Google account that isn't the named account's
const ACCOUNT_MISMATCH_CODE = 'TURNKEY_ACCOUNT_MISMATCH'

/**
 * Posts to ui-api's Turnkey sign-in routes. With a `subOrgId` they only sign in
 * to that account, and refuse any other.
 */
async function postToTurnkeyRoute<T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`${TURNKEY_API_SERVER_ENDPOINT}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, expirationSeconds: '86400' })
  })
  const result = (await response.json().catch(() => ({}))) as {
    statusMessage?: string
    data?: { code?: string }
  } & T

  if (response.ok) {
    return result
  }

  throw result.data?.code === ACCOUNT_MISMATCH_CODE
    ? new SignInAccountError(DIFFERENT_ACCOUNT)
    : new Error(result.statusMessage || `ui-api ${path} failed`)
}

async function postToPrivy<T>(
  path: string,
  body: unknown,
  accessToken: string
): Promise<T> {
  const response = await fetch(`${PRIVY_AUTH_API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'privy-app-id': PRIVY_APP_ID,
      ...(PRIVY_CLIENT_ID ? { 'privy-client-id': PRIVY_CLIENT_ID } : {}),
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    throw new Error(`Privy ${path} failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

// Signed envelope (hex JSON in `data`) or flat bundle
function parseExportBundle(exportBundle: string) {
  const bundle = JSON.parse(exportBundle) as {
    data?: string
    ciphertext?: string
    encappedPublic?: string
  }
  const inner = bundle.data
    ? (JSON.parse(toUtf8(hexToUint8Array(bundle.data))) as typeof bundle)
    : bundle

  if (!inner.encappedPublic || !inner.ciphertext) {
    throw new Error('Export bundle is missing encappedPublic or ciphertext')
  }

  return {
    ciphertext: removeHexPrefix(inner.ciphertext),
    encappedPublic: removeHexPrefix(inner.encappedPublic)
  }
}

async function importTurnkeyKey({
  address,
  subOrgId,
  strategy,
  accessToken
}: {
  address: string
  subOrgId: string
  accessToken: string
  strategy: TurnkeyWalletStrategy
}) {
  const wallet = {
    address,
    chain_type: 'ethereum',
    entropy_type: 'private-key',
    encryption_type: 'HPKE'
  }

  const { encryption_public_key } = await postToPrivy<{
    encryption_public_key: string
  }>('/wallets/import/init', wallet, accessToken)
  const targetPublicKey = uint8ArrayToHex(
    base64ToUint8Array(encryption_public_key)
  )

  const indexedDbClient = await strategy.getIndexedDbClient()
  const { exportBundle } = await indexedDbClient.exportWalletAccount({
    address,
    targetPublicKey,
    organizationId: subOrgId
  })
  const { ciphertext, encappedPublic } = parseExportBundle(exportBundle)
  const aad = concatBytes([
    hexToUint8Array(encappedPublic),
    hexToUint8Array(targetPublicKey)
  ])

  await postToPrivy(
    '/wallets/import/submit',
    {
      external_id: subOrgId,
      wallet: {
        ...wallet,
        ciphertext: hexToBase64(ciphertext),
        encapsulated_key: hexToBase64(encappedPublic),
        hpke_config: {
          info: TURNKEY_HPKE_INFO,
          aead_algorithm: 'AES_GCM256',
          aad: uint8ArrayToBase64(aad)
        }
      }
    },
    accessToken
  )
}

async function moveKey({
  address,
  subOrgId,
  privyUserId
}: KeyMove): Promise<MigrationResult> {
  const { strategy } = await getTurnkeyWallet()
  const user = await getPrivySessionUser()

  // Tabs share the Privy session, so another tab can have changed it
  if (user?.id !== privyUserId) {
    throw new SignInAccountError(
      'Your sign-in changed in this browser. Please sign in again.'
    )
  }

  // One token for the whole move, so every request is this user's
  const accessToken = await getPrivyAccessToken()

  // Privy refuses to import the same address twice, e.g. on a retry
  if (!findPrivyWallet(user, address)) {
    await importTurnkeyKey({ address, subOrgId, strategy, accessToken })
  }

  await completePrivyMigration(accessToken)

  // Checked before ending the Turnkey session: a retry needs it
  if (!findPrivyWallet(await getPrivySessionUser(), address)) {
    throw new Error('No Privy wallet on this account')
  }

  await strategy.disconnect().catch(() => undefined)

  return { type: 'ready', address }
}

// Signing in to Turnkey with a second code

/**
 * wallet-turnkey's initOTP and initSms send no sub-org (they name it
 * `suborgId`), so ui-api would pick the first sub-org with this contact. This
 * sends the code for the expected one, the way they do, then hands it to the
 * wallet's confirmOTP.
 */
async function sendTurnkeyCode(subOrgId: string, contact: SignInContact) {
  const { turnkeyWallet } = await getTurnkeyWallet()
  const indexedDbClient = await turnkeyWallet.getIndexedDbClient()

  await indexedDbClient.resetKeyPair()

  const { otpId, organizationId } = await postToTurnkeyRoute<{
    otpId?: string
    organizationId?: string
  }>('/turnkey/otp/init', {
    ...contact,
    subOrgId,
    targetPublicKey: await indexedDbClient.getPublicKey(),
    isUsingIndexedDB: true
  })

  if (!otpId || organizationId !== subOrgId) {
    throw new SignInAccountError(DIFFERENT_ACCOUNT)
  }

  // confirmOTP reads these; otpId has no setter
  Object.assign(turnkeyWallet, { otpId, userOrganizationId: organizationId })
}

// Sends the code, then asks for it until one signs in
async function signInToTurnkeyWithCode(
  subOrgId: string,
  contact: SignInContact,
  askCode: AskCode
) {
  const { strategy, turnkeyWallet } = await getTurnkeyWallet()
  const resend = () => sendTurnkeyCode(subOrgId, contact)
  let error: unknown

  await resend()

  for (;;) {
    const code = await askCode({ error, resend })
    const session = await turnkeyWallet.confirmOTP(code).catch((e: unknown) => {
      error = e
    })

    if (!session) {
      continue
    }

    if (session.organizationId !== subOrgId) {
      await strategy.disconnect().catch(() => undefined)

      throw new SignInAccountError(DIFFERENT_ACCOUNT)
    }

    return
  }
}

// Signing in to Turnkey with Google

// Set while this tab is away at Google for the key move
const GOOGLE_RETURN_EXPECTED = 'privy-migration:google-return'

/**
 * Whether this tab left for Google for the key move, asked once. A Google
 * token in the URL that nobody asked for (an old link, another window) is not ours.
 */
export function takeTurnkeyGoogleReturn() {
  const isExpected = sessionStorage.getItem(GOOGLE_RETURN_EXPECTED) === '1'

  sessionStorage.removeItem(GOOGLE_RETURN_EXPECTED)

  return isExpected
}

/**
 * Leaves the page for Google, like the old web's sign-in. It never returns:
 * Google comes back to the site with a token, and the sign-in runs again
 * with it (`googleIdToken`).
 */
async function leaveForTurnkeyGoogle(): Promise<never> {
  const { turnkeyWallet } = await getTurnkeyWallet()
  const url = await turnkeyWallet.initOAuth(TurnkeyProvider.Google)

  sessionStorage.setItem(GOOGLE_RETURN_EXPECTED, '1')
  window.location.assign(url)

  return new Promise<never>(() => undefined)
}

/**
 * Like the old web's Google sign-in (wallet-turnkey's confirmOAuth), but for
 * the expected account only. Google bound the token to this browser's key.
 */
async function signInToTurnkeyWithGoogle(subOrgId: string, idToken: string) {
  const { turnkeyWallet } = await getTurnkeyWallet()
  const indexedDbClient = await turnkeyWallet.getIndexedDbClient()
  const result = await postToTurnkeyRoute<{
    organizationId?: string
    credentialBundle?: string
  }>('/turnkey/oauth', {
    subOrgId,
    oidcToken: idToken,
    providerName: TurnkeyProvider.Google,
    targetPublicKey: await indexedDbClient.getPublicKey()
  }).catch((e: unknown) => {
    // Another Google account, or an account the app made that the web can't match
    throw e instanceof SignInAccountError
      ? new SignInAccountError(
          'Use the Google account you signed in with. If that fails, open the mobile app and sign in there once.'
        )
      : e
  })

  if (!result.credentialBundle || result.organizationId !== subOrgId) {
    throw new SignInAccountError(DIFFERENT_ACCOUNT)
  }

  await indexedDbClient.loginWithSession(result.credentialBundle)
  Object.assign(turnkeyWallet, { userOrganizationId: subOrgId })
}

type TurnkeyAccount = NonNullable<PrivyMigrationStatus['turnkey']>

/** How the person proves the Turnkey account is theirs */
type TurnkeySignIn = {
  askCode: AskCode
  contact: SignInContact
  /** Google is back from leaveForTurnkeyGoogle() */
  googleIdToken?: string
  /** They signed in to Privy with Google */
  isGoogleSignIn?: boolean
}

/**
 * Signs in to the Turnkey account, which the key move needs. As in the app:
 * with Google when the person signed in with Google or the account has no
 * code to send, otherwise with a code to the account's own email or phone.
 */
async function signInToTurnkey(
  turnkey: TurnkeyAccount,
  { contact, askCode, isGoogleSignIn, googleIdToken }: TurnkeySignIn
) {
  const { subOrgId, reverifyMethods } = turnkey
  const codeContact = getTurnkeyCodeContact(turnkey, contact)

  if (googleIdToken) {
    return signInToTurnkeyWithGoogle(subOrgId, googleIdToken)
  }

  if (reverifyMethods.includes('google') && (isGoogleSignIn || !codeContact)) {
    return leaveForTurnkeyGoogle()
  }

  if (codeContact) {
    return signInToTurnkeyWithCode(subOrgId, codeContact, askCode)
  }

  if (reverifyMethods.some((method) => SIGN_IN_CODE_METHODS.includes(method))) {
    throw new SignInAccountError(USE_PREVIOUS_SIGN_IN)
  }

  // Apple accounts can only be confirmed in the mobile app
  throw new SignInAccountError(
    reverifyMethods.includes('sms') &&
      reverifyMethods.every((method) => method === 'sms')
      ? PHONE_SIGN_IN_UNAVAILABLE
      : 'To finish signing in, open the mobile app and sign in there once. After that you can sign in here too.'
  )
}

/**
 * Moves the Turnkey key into the signed-in Privy user unless it is moved
 * already, and returns which Privy wallet to use. Every check is here.
 * Without a Turnkey session for the account, the person signs in to it first.
 */
export async function migrate({
  user,
  turnkeySession,
  ...turnkeySignIn
}: {
  user: PrivyUser
  /** From connectTurnkey() */
  turnkeySession: null | string
} & TurnkeySignIn): Promise<MigrationResult> {
  const status = await fetchPrivyMigrationStatus(await getPrivyAccessToken())

  if (status.status === 'ready') {
    // The tab closed after the import, before the move was recorded
    if (
      status.turnkey &&
      !user.custom_metadata?.migrated_at &&
      turnkeySession === status.turnkey.subOrgId
    ) {
      await completePrivyMigration(await getPrivyAccessToken())
      await (await getTurnkeyWallet()).strategy.disconnect().catch(() => {})
    }

    return { type: 'ready', address: status.address ?? undefined }
  }

  if (status.status === 'new_user') {
    if (turnkeySession) {
      throw new SignInAccountError(USE_PREVIOUS_SIGN_IN)
    }

    return { type: 'new_user' }
  }

  if (status.status === 'needs_migration' && status.turnkey) {
    const { address, subOrgId } = status.turnkey

    if (turnkeySession !== subOrgId) {
      await signInToTurnkey(status.turnkey, turnkeySignIn)
    }

    return moveKey({ address, subOrgId, privyUserId: user.id })
  }

  const existingSignIn =
    status.conflict?.reason === 'use_existing_sign_in'
      ? status.conflict.existingSignIn
      : undefined

  if (existingSignIn) {
    const { hint, method } = existingSignIn

    throw new SignInAccountError(
      method === 'sms'
        ? PHONE_SIGN_IN_UNAVAILABLE
        : `You usually sign in with ${hint || SIGN_IN_METHOD_LABELS[method]}. Continue with your ${SIGN_IN_METHOD_NOUNS[method]} to get to your account.`
    )
  }

  throw new SignInAccountError(
    "We couldn't sign you in. Please contact support."
  )
}
