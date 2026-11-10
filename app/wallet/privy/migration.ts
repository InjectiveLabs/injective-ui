import { Wallet } from '@injectivelabs/wallet-base'
import { GeneralException } from '@injectivelabs/exceptions'
import { PRIVY_APP_ID, PRIVY_CLIENT_ID } from '../../utils/constant'
import { bytesToHex, hexToBytes, concatBytes, hexToString } from 'viem'
import {
  base64ToUint8Array,
  uint8ArrayToBase64
} from '@injectivelabs/sdk-ts/utils'
import {
  completePrivyMigration,
  fetchPrivyMigrationStatus
} from '../../service/app/privyMigration'
import {
  findPrivyWallet,
  createPrivyWallet,
  getPrivySessionUser,
  getPrivyAccessToken
} from './client'
import { getWalletStrategy, TURNKEY_API_SERVER_ENDPOINT } from '../strategy'
import type {
  TurnkeyWallet,
  TurnkeyWalletStrategy
} from '@injectivelabs/wallet-turnkey'
import type { PrivyUser, PrivyEmbeddedWallet } from './client'
import type { SignInMethod } from '../../service/app/privyMigration'

// Moves Turnkey keys into Privy. Delete once every account has moved.

export type SignInContact = { email?: string; phone?: string }

export type PendingTurnkeyMove = {
  userId: string
  address: string
  subOrgId: string
  contact: SignInContact
}

export type PrivySignInResult =
  | { type: 'code_sent'; move: PendingTurnkeyMove }
  | { type: 'wallet'; user: PrivyUser; wallet: PrivyEmbeddedWallet }

export const SIGN_IN_ACCOUNT_ERROR = 'sign-in-account'

/** A GeneralException, so the app's error handler shows it. */
export class SignInAccountError extends GeneralException {
  constructor(message: string) {
    super(new Error(message), { context: SIGN_IN_ACCOUNT_ERROR })
  }
}

const PRIVY_AUTH_API_URL = 'https://auth.privy.io/api/v1'
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
/** base64 of "turnkey_hpke": the HPKE info Turnkey uses for export bundles. */
const TURNKEY_HPKE_INFO = 'dHVybmtleV9ocGtl'

const stripHexPrefix = (hex: string) =>
  hex.startsWith('0x') ? hex.slice(2) : hex
const toHex = (hex: string) => `0x${stripHexPrefix(hex)}` as const
const hexToBase64 = (hex: string) => uint8ArrayToBase64(hexToBytes(toHex(hex)))
const base64ToHex = (b64: string) =>
  bytesToHex(base64ToUint8Array(b64)).slice(2)

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

// Only a key move uses the session; a leftover one blocks a new sign-in
export async function endTurnkeySession() {
  try {
    await (await getTurnkeyWallet()).strategy.disconnect()
  } catch (e) {
    console.warn('Ending the Turnkey session failed', e)
  }
}

// Recording an already imported key needs the session, so it goes first
export async function abandonTurnkeyMove({
  address
}: Pick<PendingTurnkeyMove, 'address'>) {
  try {
    if (findPrivyWallet(await getPrivySessionUser(), address)) {
      await completePrivyMigration(await getPrivyAccessToken())
    }
  } catch (e) {
    console.warn('Recording the key move failed', e)
  }

  await endTurnkeySession()
}

async function getTurnkeySessionOrgId(): Promise<null | string> {
  try {
    const { turnkeyWallet } = await getTurnkeyWallet()
    const { session, organizationId } = await turnkeyWallet.getSession()

    return session && organizationId ? organizationId : null
  } catch (e) {
    console.warn('Reading the Turnkey session failed', e)

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
    SIGN_IN_CODE_METHODS.includes('sms') &&
    turnkey.reverifyMethods.includes('sms') &&
    maskPhone(contact.phone) === turnkey.phoneHint
  ) {
    return { phone: contact.phone }
  }

  return null
}

/**
 * wallet-turnkey's initOTP sends no sub-org (and names it `suborgId`), so
 * ui-api would pick the first sub-org with this email. This sends the code for
 * the expected one, the way initOTP does, then hands it to the wallet's confirmOTP.
 */
async function initTurnkeyEmailCode(
  turnkeyWallet: TurnkeyWallet,
  email: string,
  subOrgId: string
) {
  const indexedDbClient = await turnkeyWallet.getIndexedDbClient()

  await indexedDbClient.resetKeyPair()

  const response = await fetch(
    `${TURNKEY_API_SERVER_ENDPOINT}/turnkey/otp/init`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        subOrgId,
        targetPublicKey: await indexedDbClient.getPublicKey(),
        isUsingIndexedDB: true,
        expirationSeconds: '86400'
      })
    }
  )
  const result = (await response.json().catch(() => ({}))) as {
    otpId?: string
    statusMessage?: string
    organizationId?: string
  }

  if (!response.ok || !result.otpId || !result.organizationId) {
    const message = result.statusMessage || 'Failed to send the code'

    if (/does not belong to the account/i.test(message)) {
      throw new SignInAccountError(
        'This sign-in belongs to a different account. Please contact support.'
      )
    }

    throw new Error(message)
  }

  // confirmOTP reads these; otpId has no setter
  Object.assign(turnkeyWallet, {
    otpId: result.otpId,
    userOrganizationId: result.organizationId
  })

  return result
}

export async function sendTurnkeyCode({
  subOrgId,
  contact
}: PendingTurnkeyMove) {
  const { turnkeyWallet } = await getTurnkeyWallet()
  const result = contact.email
    ? await initTurnkeyEmailCode(turnkeyWallet, contact.email, subOrgId)
    : await turnkeyWallet.initSms(contact.phone ?? '')

  if (result.organizationId !== subOrgId) {
    throw new SignInAccountError(
      'This sign-in belongs to a different account. Please contact support.'
    )
  }
}

async function postToPrivy<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${PRIVY_AUTH_API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'privy-app-id': PRIVY_APP_ID,
      ...(PRIVY_CLIENT_ID ? { 'privy-client-id': PRIVY_CLIENT_ID } : {}),
      Authorization: `Bearer ${await getPrivyAccessToken()}`
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
    ? (JSON.parse(hexToString(toHex(bundle.data))) as typeof bundle)
    : bundle

  if (!inner.encappedPublic || !inner.ciphertext) {
    throw new Error('Export bundle is missing encappedPublic or ciphertext')
  }

  return {
    ciphertext: stripHexPrefix(inner.ciphertext),
    encappedPublic: stripHexPrefix(inner.encappedPublic)
  }
}

async function importTurnkeyKey({
  address,
  subOrgId,
  strategy
}: Pick<
  PendingTurnkeyMove,
  'address' | 'subOrgId'
> & { strategy: TurnkeyWalletStrategy }) {
  const wallet = {
    address,
    chain_type: 'ethereum',
    entropy_type: 'private-key',
    encryption_type: 'HPKE'
  }

  const { encryption_public_key } = await postToPrivy<{
    encryption_public_key: string
  }>('/wallets/import/init', wallet)
  const targetPublicKey = base64ToHex(encryption_public_key)

  const indexedDbClient = await strategy.getIndexedDbClient()
  const { exportBundle } = await indexedDbClient.exportWalletAccount({
    address,
    targetPublicKey,
    organizationId: subOrgId
  })
  const { ciphertext, encappedPublic } = parseExportBundle(exportBundle)
  const aad = concatBytes([
    hexToBytes(toHex(encappedPublic)),
    hexToBytes(toHex(targetPublicKey))
  ])

  await postToPrivy('/wallets/import/submit', {
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
  })
}

async function moveKey({
  userId,
  address,
  subOrgId
}: Omit<PendingTurnkeyMove, 'contact'>): Promise<PrivySignInResult> {
  const { strategy } = await getTurnkeyWallet()
  const user = await getPrivySessionUser()

  // Tabs share the Privy session: the key must go to the user who started the move
  if (user?.id !== userId) {
    throw new SignInAccountError(
      'Your sign-in changed in another tab. Please sign in again.'
    )
  }

  // Privy refuses to import the same address twice, e.g. on a retry
  if (!findPrivyWallet(user, address)) {
    await importTurnkeyKey({ address, subOrgId, strategy })
  }

  // Read the wallet before ending the Turnkey session: a retry needs it
  await completePrivyMigration(await getPrivyAccessToken())
  const result = walletResult(await getPrivySessionUser(), address)

  await endTurnkeySession()

  return result
}

function walletResult(
  user: null | PrivyUser,
  address?: string
): PrivySignInResult {
  const wallet = findPrivyWallet(user, address)

  if (!user || !wallet) {
    throw new Error('No Privy wallet on this account')
  }

  return { type: 'wallet', user, wallet }
}

export async function resolvePrivyWallet({
  user,
  contact
}: {
  user: PrivyUser
  contact: SignInContact
}): Promise<PrivySignInResult> {
  const status = await fetchPrivyMigrationStatus(await getPrivyAccessToken())

  if (status.status === 'ready') {
    // The tab closed after the import, before the move was recorded
    if (
      status.turnkey &&
      !user.custom_metadata?.migrated_at &&
      (await getTurnkeySessionOrgId()) === status.turnkey.subOrgId
    ) {
      await completePrivyMigration(await getPrivyAccessToken())
      await endTurnkeySession()
    }

    return walletResult(user, status.address ?? undefined)
  }

  if (status.status === 'new_user') {
    if (await getTurnkeySessionOrgId()) {
      throw new SignInAccountError(USE_PREVIOUS_SIGN_IN)
    }

    return walletResult(await createPrivyWallet())
  }

  if (status.status === 'needs_migration' && status.turnkey) {
    const { address, subOrgId } = status.turnkey

    if ((await getTurnkeySessionOrgId()) === subOrgId) {
      return moveKey({ address, subOrgId, userId: user.id })
    }

    const codeContact = getTurnkeyCodeContact(status.turnkey, contact)

    if (!codeContact) {
      const { reverifyMethods } = status.turnkey

      if (
        reverifyMethods.some((method) => SIGN_IN_CODE_METHODS.includes(method))
      ) {
        throw new SignInAccountError(USE_PREVIOUS_SIGN_IN)
      }

      // Accounts made in the mobile app with Google or Apple can only be confirmed there
      throw new SignInAccountError(
        reverifyMethods.includes('sms') &&
          reverifyMethods.every((method) => method === 'sms')
          ? PHONE_SIGN_IN_UNAVAILABLE
          : 'To finish signing in, open the mobile app and sign in there once. After that you can sign in here too.'
      )
    }

    const move = { address, subOrgId, userId: user.id, contact: codeContact }

    await sendTurnkeyCode(move)

    return { type: 'code_sent', move }
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

export async function finishWithTurnkeyCode(
  move: PendingTurnkeyMove,
  code: string
) {
  // On a retry the code is spent, but the session is already here
  if ((await getTurnkeySessionOrgId()) !== move.subOrgId) {
    const { turnkeyWallet } = await getTurnkeyWallet()
    const result = await turnkeyWallet.confirmOTP(code)

    if (result.organizationId !== move.subOrgId) {
      await endTurnkeySession()

      throw new SignInAccountError(
        'This sign-in belongs to a different account. Please contact support.'
      )
    }
  }

  return moveKey(move)
}
