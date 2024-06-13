import { TokenStatic } from '@injectivelabs/sdk-ts'

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

export interface SharedSubaccountBalanceWithToken {
  availableBalance: string
  totalBalance: string
  denom: string
  token: TokenStatic
}
