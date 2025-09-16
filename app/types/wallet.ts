import type { Wallet } from '@injectivelabs/wallet-base'

export interface AutoSign {
  duration: number
  privateKey: string
  expiration: number
  injectiveAddress: string
}

export type SharedWalletOption = {
  beta?: boolean
  wallet: Wallet
  downloadLink?: string
}
