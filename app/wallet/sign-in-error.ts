import { GeneralException } from '@injectivelabs/exceptions'
import type { SignInErrorReason, SignInErrorDetails } from '../types'

const CODE_ERROR_REASONS = new Set<SignInErrorReason>([
  'rate_limited',
  'wrong_code',
  'expired',
  'network',
  'unknown'
])

/** A failed sign-in. The app's error handler shows it; the product words the `reason` */
export class SignInError extends GeneralException {
  get isAccountError() {
    return !CODE_ERROR_REASONS.has(this.reason)
  }

  constructor(
    readonly reason: SignInErrorReason,
    readonly details: SignInErrorDetails = {},
    message = `Sign-in error: ${reason}`
  ) {
    super(new Error(message))
  }
}
