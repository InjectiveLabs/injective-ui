import { it, expect, describe } from 'vitest'
import { SignInError } from '../wallet/sign-in-error'
import {
  getSsoCodeError,
  isSignInAccountError,
  getSsoGoogleRedirect,
  clearSsoGoogleRedirect
} from './sso'

describe('getSsoGoogleRedirect', () => {
  it('reads the code and state Privy returns from Google', () => {
    expect(
      getSsoGoogleRedirect({
        hash: '',
        search: '?privy_oauth_code=code&privy_oauth_state=state'
      })
    ).toEqual({ type: 'privy', code: 'code', state: 'state' })
  })

  it('ignores a page without both values', () => {
    expect(
      getSsoGoogleRedirect({ hash: '', search: '?privy_oauth_code=code' })
    ).toBe(null)
    expect(getSsoGoogleRedirect({ hash: '', search: '' })).toBe(null)
  })
})

describe('clearSsoGoogleRedirect', () => {
  it("removes only the sign-in's values, for the router too", async () => {
    const router = useRouter()

    await router.replace(
      '/?ref=abc&privy_oauth_code=code&privy_oauth_state=state&privy_oauth_provider=google#id_token=token'
    )

    await clearSsoGoogleRedirect()

    expect(router.currentRoute.value.query).toEqual({ ref: 'abc' })
    expect(router.currentRoute.value.hash).toBe('')
    expect(window.location.search).toBe('?ref=abc')
    expect(window.location.hash).toBe('')
  })
})

describe('isSignInAccountError', () => {
  it('matches only sign-in account errors', () => {
    expect(isSignInAccountError(new SignInError('use_app'))).toBe(true)
    expect(isSignInAccountError(new SignInError('rate_limited'))).toBe(false)
    expect(isSignInAccountError(new Error('sign-in-account'))).toBe(false)
    expect(isSignInAccountError(null)).toBe(false)
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
