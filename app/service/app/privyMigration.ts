import { isAxiosError } from 'axios'
import { UiApiService } from '../../providers/uiApi'
import { TURNKEY_SESSION_SECONDS } from '../../utils/constant'
import { TURNKEY_API_SERVER_ENDPOINT } from '../../wallet/strategy'
import type { PrivyMigrationStatus } from '../../types'

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

type TurnkeyMoveCodeRequest = {
  email?: string
  phone?: string
  isUsingIndexedDB: boolean
  targetPublicKey: null | string
}

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

/**
 * The key move's second code: a Turnkey code to the account's own email or
 * phone. ui-api picks the account from the Privy user, so it needs no captcha.
 */
export async function sendTurnkeyMoveCode(
  accessToken: string,
  request: TurnkeyMoveCodeRequest
) {
  try {
    const { data } = await uiApi.client.post<{
      otpId?: string
      organizationId?: string
    }>(
      'privy/migration/turnkey-code',
      { ...request, expirationSeconds: TURNKEY_SESSION_SECONDS },
      bearer(accessToken)
    )

    return data
  } catch (e) {
    throw toMigrationError(e)
  }
}
