import { concatBytes } from 'viem'
import { GeneralException } from '@injectivelabs/exceptions'
import { Wallet, TurnkeyProvider } from '@injectivelabs/wallet-base'
import { signInToTurnkeyWithOidcToken } from '../../service/app/turnkeySignIn'
import {
  findPrivyWallet,
  getPrivySessionUser,
  getPrivyAccessToken
} from '../privy/client'
import {
  TURNKEY_HPKE_INFO,
  CONTACT_HINT_MASK,
  SIGN_IN_ACCOUNT_ERROR
} from '../../utils/constant'
import {
  initPrivyWalletImport,
  submitPrivyWalletImport
} from '../../service/app/privyWalletImport'
import {
  sendTurnkeyMoveCode,
  completePrivyMigration,
  fetchPrivyMigrationStatus
} from '../../service/app/privyMigration'
import {
  toUtf8,
  hexToBase64,
  removeHexPrefix,
  uint8ArrayToHex,
  hexToUint8Array,
  base64ToUint8Array,
  uint8ArrayToBase64
} from '@injectivelabs/sdk-ts/utils'
import { getWalletStrategy } from '../strategy'
import type {
  TurnkeyWallet,
  TurnkeyWalletStrategy
} from '@injectivelabs/wallet-turnkey'
import type { PrivyUser } from '../privy/client'
import type { PrivyWalletImport } from '../../service/app/privyWalletImport'
import type {
  AskCode,
  SignInContact,
  MigrationResult,
  PrivyMigrationStatus,
  TurnkeyAccountContact,
  SignInAccountErrorReason,
  SignInAccountErrorDetails
} from '../../types'

type KeyMove = { address: string; subOrgId: string; privyUserId: string }

type TurnkeyAccount = NonNullable<PrivyMigrationStatus['turnkey']>

type TurnkeySignIn = {
  askCode: AskCode
  contact: SignInContact
  /** Google's token, back from the second sign-in at Google */
  googleIdToken?: string
  isGoogleSignIn?: boolean
}

const ACCOUNT_MISMATCH_CODE = 'TURNKEY_ACCOUNT_MISMATCH'

const GOOGLE_RETURN_EXPECTED = 'privy-migration:google-return'

/**
 * A GeneralException, so the app's error handler shows it. The product words
 * the `reason`.
 */
export class SignInAccountError extends GeneralException {
  constructor(
    readonly reason: SignInAccountErrorReason,
    readonly details: SignInAccountErrorDetails = {}
  ) {
    super(new Error(`Sign-in account error: ${reason}`), {
      context: SIGN_IN_ACCOUNT_ERROR
    })
  }
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

async function endTurnkeySession() {
  const { strategy } = await getTurnkeyWallet()

  await strategy.disconnect().catch(() => undefined)
}

function maskEmail(email: string) {
  const at = email.lastIndexOf('@')
  const local = email.slice(0, at)
  const last = local.length > 1 ? local[local.length - 1] : ''

  return at <= 0
    ? CONTACT_HINT_MASK
    : `${local[0]}${CONTACT_HINT_MASK}${last}@${email.slice(at + 1)}`
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')

  return digits.length >= 4 ? `•••• ${digits.slice(-4)}` : '••••'
}

function getTurnkeyCodeContact(
  turnkey: TurnkeyAccount,
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

function toAccountMismatchError(reason: SignInAccountErrorReason) {
  return (e: unknown) =>
    (e as null | { code?: unknown })?.code === ACCOUNT_MISMATCH_CODE
      ? new SignInAccountError(reason)
      : e
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
  const wallet: PrivyWalletImport = {
    address,
    chain_type: 'ethereum',
    encryption_type: 'HPKE',
    entropy_type: 'private-key'
  }

  const { encryption_public_key } = await initPrivyWalletImport(
    wallet,
    accessToken
  )
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

  await submitPrivyWalletImport(
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
    throw new SignInAccountError('session_changed')
  }

  const accessToken = await getPrivyAccessToken()

  // Privy refuses to import the same address twice, e.g. on a retry
  if (!findPrivyWallet(user, address)) {
    await importTurnkeyKey({ address, subOrgId, strategy, accessToken })
  }

  await completePrivyMigration(accessToken)

  if (!findPrivyWallet(await getPrivySessionUser(), address)) {
    throw new Error('No Privy wallet on this account')
  }

  await strategy.disconnect().catch(() => undefined)

  return { type: 'ready', address }
}

async function sendTurnkeyCode(subOrgId: string, contact: SignInContact) {
  const { turnkeyWallet } = await getTurnkeyWallet()
  const indexedDbClient = await turnkeyWallet.getIndexedDbClient()

  await indexedDbClient.resetKeyPair()

  const { otpId, organizationId } = await sendTurnkeyMoveCode(
    await getPrivyAccessToken(),
    {
      ...contact,
      isUsingIndexedDB: true,
      targetPublicKey: await indexedDbClient.getPublicKey()
    }
  ).catch((e: unknown) =>
    Promise.reject(toAccountMismatchError('different_account')(e))
  )

  if (!otpId || organizationId !== subOrgId) {
    throw new SignInAccountError('different_account')
  }

  // confirmOTP reads these; otpId has no setter
  Object.assign(turnkeyWallet, { otpId, userOrganizationId: organizationId })
}

async function signInToTurnkeyWithCode({
  askCode,
  contact,
  subOrgId
}: {
  askCode: AskCode
  subOrgId: string
  contact: SignInContact
}) {
  const { strategy, turnkeyWallet } = await getTurnkeyWallet()
  const resend = () => sendTurnkeyCode(subOrgId, contact)
  let error: unknown

  await resend().catch((e: unknown) => {
    const { status } = (e ?? {}) as { status?: unknown }
    const isRetryable =
      typeof status !== 'number' || status === 429 || status >= 500

    if (e instanceof SignInAccountError || !isRetryable) {
      throw e
    }

    error = e
  })

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

      throw new SignInAccountError('different_account')
    }

    return
  }
}

/**
 * Whether this tab left for Google for the key move, asked once. A Google
 * token in the URL that nobody asked for (an old link, another window) is not ours.
 */
export function takeTurnkeyGoogleReturn() {
  const isExpected = sessionStorage.getItem(GOOGLE_RETURN_EXPECTED) === '1'

  sessionStorage.removeItem(GOOGLE_RETURN_EXPECTED)

  return isExpected
}

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
  const result = await signInToTurnkeyWithOidcToken({
    subOrgId,
    oidcToken: idToken,
    providerName: TurnkeyProvider.Google,
    targetPublicKey: await indexedDbClient.getPublicKey()
  }).catch((e: unknown) =>
    Promise.reject(toAccountMismatchError('use_google')(e))
  )

  if (!result.credentialBundle || result.organizationId !== subOrgId) {
    throw new SignInAccountError('different_account')
  }

  await indexedDbClient.loginWithSession(result.credentialBundle)
  Object.assign(turnkeyWallet, { userOrganizationId: subOrgId })
}

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
    return signInToTurnkeyWithCode({ askCode, subOrgId, contact: codeContact })
  }

  if (reverifyMethods.includes('email')) {
    throw new SignInAccountError('use_previous_contact')
  }

  // This layer has no phone sign-in
  throw reverifyMethods.length > 0 &&
    reverifyMethods.every((method) => method === 'sms')
    ? new SignInAccountError('use_previous_contact', { method: 'sms' })
    : new SignInAccountError('use_app')
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
    if (status.turnkey && !user.custom_metadata?.migrated_at) {
      await completePrivyMigration(await getPrivyAccessToken()).catch(
        () => undefined
      )
    }

    if (turnkeySession) {
      await endTurnkeySession()
    }

    return { type: 'ready', address: status.address ?? undefined }
  }

  if (status.status === 'new_user') {
    return { type: 'new_user' }
  }

  if (status.status === 'needs_migration' && status.turnkey) {
    const { address, subOrgId } = status.turnkey

    if (turnkeySession !== subOrgId) {
      await signInToTurnkey(status.turnkey, turnkeySignIn)
    }

    return moveKey({ address, subOrgId, privyUserId: user.id })
  }

  const existingSignIn = status.conflict?.existingSignIn

  throw existingSignIn
    ? new SignInAccountError('use_existing_sign_in', existingSignIn)
    : new SignInAccountError('unavailable')
}
