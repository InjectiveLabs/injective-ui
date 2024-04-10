import { TokenStatic } from '@injectivelabs/token-metadata'

export interface SharedBalanceWithTokenAndPrice {
  denom: string
  balance: string
  usdPrice: number
  token: TokenStatic
}

export interface SharedBalanceInUsdWithTokenAndPrice
  extends SharedBalanceWithTokenAndPrice {
  balanceInUsd: string
}
