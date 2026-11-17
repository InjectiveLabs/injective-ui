import { createCodePrompt } from './codePrompt'
import { SignInError } from '../wallet/sign-in-error'
import type { SignInCodeErrorReason } from '../types'

/**
 * What Google brought back to the site: `privy` is Privy's sign-in, `turnkey`
 * is Google confirming the Turnkey account of a key move.
 */
export type SsoGoogleRedirect =
  | { type: 'turnkey'; idToken: string }
  | { code: string; type: 'privy'; state: string }

/**
 * The Google sign-in result in the URL. Read once when the app starts: page
 * redirects drop it afterwards. Doesn't load Privy, so it's cheap on every load.
 */
export function getSsoGoogleRedirect(
  location: Pick<Location, 'hash' | 'search'>
): null | SsoGoogleRedirect {
  const query = new URLSearchParams(location.search)
  const code = query.get('privy_oauth_code')
  const state = query.get('privy_oauth_state')
  const idToken = new URLSearchParams(location.hash.slice(1)).get('id_token')

  if (code && state) {
    return { type: 'privy', code, state }
  }

  return idToken ? { type: 'turnkey', idToken } : null
}

const SSO_GOOGLE_QUERY = [
  'privy_oauth_code',
  'privy_oauth_state',
  'privy_oauth_provider'
]

export function omitSsoGoogleQuery<T>(query: Record<string, T>) {
  return Object.fromEntries(
    Object.entries(query).filter(([key]) => !SSO_GOOGLE_QUERY.includes(key))
  )
}

/**
 * Removes the sign-in result from the URL, so a reload can't use it twice.
 * Through the router, or its next redirect would bring the values back.
 */
export async function clearSsoGoogleRedirect() {
  const router = useRouter()
  const { path, query } = router.currentRoute.value

  await router.replace({ path, hash: '', query: omitSsoGoogleQuery(query) })
}

export const ssoSecondCode = createCodePrompt()

let ssoSignInId = 0

export const getSsoSignInId = () => ssoSignInId

/**
 * Ends the sign-in in progress, also one waiting for a second code (modal
 * closed, logout, another wallet). Here, so that it works before Privy loads.
 */
export function abandonSsoSignIn() {
  ssoSignInId++
  ssoSecondCode.cancel()
}

export function isSignInAccountError(error: unknown): error is SignInError {
  return error instanceof SignInError && error.isAccountError
}

// Turnkey errors (through ui-api) only have a message, so those are read from the text
export function getSsoCodeError(error: unknown): SignInCodeErrorReason {
  const { code, status } = (error ?? {}) as { code?: unknown; status?: unknown }
  const message = error instanceof Error ? error.message : String(error)

  if (
    status === 429 ||
    code === 'too_many_requests' ||
    /too many|rate.?limit|turnkey error 8:|max_otp/i.test(message)
  ) {
    return 'rate_limited'
  }

  // Only a code's own wording: a failed key move can say "expired" too (session)
  if (/\b(otp|code) (has |is )?expired|expired (otp|code)\b/i.test(message)) {
    return 'expired'
  }

  // Only a code's own wording: other "invalid" errors (API key, email) aren't the code
  if (
    code === 'invalid_credentials' ||
    /(invalid|incorrect|wrong) (otp|code|verification code)\b|\b(otp|code) (is )?(invalid|incorrect)/i.test(
      message
    )
  ) {
    return 'wrong_code'
  }

  if (/failed to fetch|load failed|network|timed? ?out/i.test(message)) {
    return 'network'
  }

  return 'unknown'
}
