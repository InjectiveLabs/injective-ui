// Doesn't load Privy, so it's cheap on every page load
export function getSsoGoogleRedirect(
  location: Pick<Location, 'search'>
): null | { code: string; state: string } {
  const query = new URLSearchParams(location.search)
  const code = query.get('privy_oauth_code')
  const state = query.get('privy_oauth_state')

  return code && state ? { code, state } : null
}

export function clearSsoGoogleRedirect() {
  const url = new URL(window.location.href)

  for (const key of [
    'privy_oauth_code',
    'privy_oauth_state',
    'privy_oauth_provider'
  ]) {
    url.searchParams.delete(key)
  }

  window.history.replaceState(window.history.state, '', url.toString())
}

// Bumped when a sign-in is given up (modal closed, logout, another wallet)
let ssoSignInId = 0

export const getSsoSignInId = () => ssoSignInId

export function abandonSsoSignIn() {
  ssoSignInId++
}

export function isSsoAccountError(error: unknown) {
  // SIGN_IN_ACCOUNT_ERROR; importing it would load Privy
  return (error as null | { context?: unknown })?.context === 'sign-in-account'
}

export type SsoCodeError =
  | 'expired'
  | 'network'
  | 'unknown'
  | 'wrong_code'
  | 'rate_limited'

// Turnkey errors (through ui-api) only have a message, so those are read from the text
export function getSsoCodeError(error: unknown): SsoCodeError {
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
