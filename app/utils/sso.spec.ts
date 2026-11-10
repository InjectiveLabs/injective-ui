import { it, expect, describe } from 'vitest'
import {
  getSsoCodeError,
  isSsoAccountError,
  getSsoGoogleRedirect,
  clearSsoGoogleRedirect
} from './sso'

describe('getSsoGoogleRedirect', () => {
  it('reads the code and state Privy returns from Google', () => {
    expect(
      getSsoGoogleRedirect({
        search: '?privy_oauth_code=code&privy_oauth_state=state'
      })
    ).toEqual({ code: 'code', state: 'state' })
  })

  it('ignores a page without both values', () => {
    expect(getSsoGoogleRedirect({ search: '?privy_oauth_code=code' })).toBe(
      null
    )
    expect(getSsoGoogleRedirect({ search: '' })).toBe(null)
  })
})

describe('clearSsoGoogleRedirect', () => {
  it("removes only Privy's values from the URL", () => {
    window.history.replaceState(
      null,
      '',
      '/?ref=abc&privy_oauth_code=code&privy_oauth_state=state&privy_oauth_provider=google'
    )

    clearSsoGoogleRedirect()

    expect(window.location.search).toBe('?ref=abc')
  })
})

describe('isSsoAccountError', () => {
  it('matches only sign-in account errors', () => {
    expect(isSsoAccountError({ context: 'sign-in-account' })).toBe(true)
    expect(isSsoAccountError(new Error('sign-in-account'))).toBe(false)
    expect(isSsoAccountError(null)).toBe(false)
  })
})

describe('getSsoCodeError', () => {
  it.each([
    [{ status: 429 }, 'rate_limited'],
    [new Error('Turnkey error 8: MAX_OTP_INITIATED'), 'rate_limited'],
    [new Error('OTP code expired'), 'expired'],
    [{ code: 'invalid_credentials' }, 'wrong_code'],
    [new Error('Invalid OTP code'), 'wrong_code'],
    [new Error('Turnkey error 3: invalid OTP code'), 'wrong_code'],
    [new Error('Turnkey error 3: Invalid API key'), 'unknown'],
    [new Error('Invalid email address'), 'unknown'],
    [new TypeError('Failed to fetch'), 'network'],
    [
      new Error('Privy /wallets/import/submit failed with status 500'),
      'unknown'
    ]
  ])('maps %o to %s', (error, expected) => {
    expect(getSsoCodeError(error)).toBe(expected)
  })
})
