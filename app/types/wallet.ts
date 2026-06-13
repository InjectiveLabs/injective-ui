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
