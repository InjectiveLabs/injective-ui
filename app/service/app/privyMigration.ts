import { isAxiosError } from 'axios'
import { UiApiService } from '../../providers/uiApi'
import { TURNKEY_API_SERVER_ENDPOINT } from '../../wallet/strategy'

export type SignInMethod = 'sms' | 'email' | 'apple' | 'google'

export type PrivyMigrationConflictReason =
  | 'multiple_sub_orgs'
  | 'unknown_oauth_issuer'
  | 'use_existing_sign_in'
  | 'wallet_in_other_user'
  | 'privy_wallet_mismatch'

export type PrivyMigrationStatus = {
  address: null | string
  status: 'ready' | 'new_user' | 'conflict' | 'needs_migration'
  conflict: null | {
    reason: PrivyMigrationConflictReason
    existingSignIn?: { hint: null | string; method: SignInMethod }
  }
  turnkey: null | {
    address: string
    subOrgId: string
    emailHint: null | string
    phoneHint: null | string
    reverifyMethods: string[]
  }
}

// Retrying won't help with these
const UNAVAILABLE_CODES = [
  'missing_token',
  'invalid_token',
  'reauth_required',
  'turnkey_unavailable',
  'privy_not_configured',
  'turnkey_wallet_not_found'
]

// The same ui-api as the Turnkey codes, so both halves of a move use one server.
// Its own client: the service index would load every service into the sign-in chunk
const uiApi = new UiApiService(TURNKEY_API_SERVER_ENDPOINT)

const bearer = (accessToken: string) => ({
  headers: { Authorization: `Bearer ${accessToken}` }
})

// ui-api answers { error: { code, message } }
function toMigrationError(e: unknown) {
  if (!isAxiosError(e)) {
    return e
  }

  const { error } = (e.response?.data ?? {}) as {
    error?: { code?: string; message?: string }
  }
  const code = error?.code ?? e.code
  // not_migrated never succeeds on a retry, so it doesn't say "try again later"
  const message =
    code === 'not_migrated'
      ? "We couldn't sign you in. Please contact support."
      : code && UNAVAILABLE_CODES.includes(code)
        ? "Sign-in isn't available right now. Please try again later."
        : error?.message || e.message

  return Object.assign(new Error(message), {
    code,
    status: e.response?.status
  })
}

export async function fetchPrivyMigrationStatus(accessToken: string) {
  try {
    const { data } = await uiApi.client.get<PrivyMigrationStatus>(
      'privy/migration',
      bearer(accessToken)
    )

    return data
  } catch (e) {
    throw toMigrationError(e)
  }
}

export async function completePrivyMigration(accessToken: string) {
  try {
    const { data } = await uiApi.client.post<PrivyMigrationStatus>(
      'privy/migration/complete',
      {},
      bearer(accessToken)
    )

    return data
  } catch (e) {
    throw toMigrationError(e)
  }
}
