import type { Wallet } from '@injectivelabs/wallet-base'

export type SharedWalletOption = {
  beta?: boolean
  wallet: Wallet
  downloadLink?: string
}

export interface AutoSign {
  version?: number
  duration: number
  publicKey?: string
  expiration: number
  storageKey?: string
  privateKey?: string
  isConfirmed?: boolean
  injectiveAddress: string
  isDeterministic?: boolean
}

export type SignInContact = { email?: string; phone?: string }

export type TurnkeyAccountContact = { isGoogle?: boolean } & SignInContact

export type SignInMethod = 'sms' | 'email' | 'apple' | 'google'

export type SignInAccountErrorReason =
  | 'use_app'
  | 'use_google'
  | 'unavailable'
  | 'session_changed'
  | 'different_account'
  | 'use_existing_sign_in'
  | 'use_previous_contact'

export type SignInCodeErrorReason =
  | 'expired'
  | 'network'
  | 'unknown'
  | 'wrong_code'
  | 'rate_limited'

export type SignInErrorReason = SignInCodeErrorReason | SignInAccountErrorReason

export type SignInErrorDetails = {
  hint?: null | string
  method?: SignInMethod
}

/** Which Privy wallet to use: the one with this address, or a new one */
export type MigrationResult =
  | { type: 'new_user' }
  | { type: 'ready'; address?: string }

/**
 * Asks the person for the code Turnkey sent, and resolves with what they typed.
 * `error` is why their last code failed; `resend` sends a new one.
 */
export type AskCode = (request: {
  error?: unknown
  resend: () => Promise<void>
}) => Promise<string>

export type PrivyMigrationConflictReason =
  | 'multiple_sub_orgs'
  | 'unknown_oauth_issuer'
  | 'use_existing_sign_in'
  | 'wallet_in_other_user'
  | 'privy_wallet_mismatch'

/** ui-api's GET /privy/migration */
export type PrivyMigrationStatus = {
  address: null | string
  status: 'ready' | 'new_user' | 'conflict' | 'needs_migration'
  conflict: null | {
    reason: PrivyMigrationConflictReason
    existingSignIn?: {
      hint: null | string
      method: SignInMethod
    }
  }
  turnkey: null | {
    address: string
    subOrgId: string
    emailHint: null | string
    phoneHint: null | string
    reverifyMethods: string[]
  }
}
