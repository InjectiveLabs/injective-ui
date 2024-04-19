import { TokenStatic } from '@injectivelabs/token-metadata'

export interface SharedDropdownOptionWithToken {
  value: string
  display: string
  token?: TokenStatic
}

export interface SharedBalanceWithToken {
  denom: string
  balance: string
  token: TokenStatic
}

export interface SharedBalanceWithTokenAndPrice extends SharedBalanceWithToken {
  usdPrice: number
}

export interface SharedBalanceInUsdWithTokenAndPrice
  extends SharedBalanceWithTokenAndPrice {
  balanceInUsd: string
}

export interface SharedCw20BalanceWithToken extends SharedBalanceWithToken {
  token: TokenStatic
}
