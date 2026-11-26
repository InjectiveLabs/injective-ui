import { SignInError } from '../wallet/sign-in-error'
import type { SignInCodeErrorReason } from '../types'

// `turnkey` is Google confirming the Turnkey account of a key move
export type SsoGoogleRedirect =
  | { type: 'turnkey'; idToken: string }
  | { code: string; type: 'privy'; state: string }

// Read once at startup: page redirects drop these URL values afterwards
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

function omitSsoGoogleQuery<T>(query: Record<string, T>) {
  return Object.fromEntries(
    Object.entries(query).filter(([key]) => !SSO_GOOGLE_QUERY.includes(key))
  )
}

// Through the router, or its next redirect would bring the values back
export async function clearSsoGoogleRedirect() {
  const router = useRouter()
  const { path, query } = router.currentRoute.value

  await router.replace({ path, hash: '', query: omitSsoGoogleQuery(query) })
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
