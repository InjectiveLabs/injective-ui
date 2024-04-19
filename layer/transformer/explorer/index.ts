import { CW20BalanceExplorerApiResponse } from '@injectivelabs/sdk-ts'
import { TokenType, TokenVerification } from '@injectivelabs/token-metadata'
import { unknownToken } from '../../data/token'
import { SharedBalanceWithToken } from '../../types'

export const toUiCw20Balance = (
  cw20Balance: CW20BalanceExplorerApiResponse
): SharedBalanceWithToken => {
  const denom = cw20Balance.contract_address
  const tokenInfo = cw20Balance.cw20_metadata.token_info
  const marketingInfo = cw20Balance.cw20_metadata?.marketing_info

  return {
    denom,
    balance: cw20Balance.balance,
    token: {
      coinGeckoId: '',
      denom,
      address: denom,
      name: tokenInfo.name || unknownToken.name,
      decimals: tokenInfo.decimals || unknownToken.decimals,
      symbol: tokenInfo.symbol || unknownToken.symbol,
      logo: marketingInfo?.logo || unknownToken.logo,
      tokenType: TokenType.Cw20,
      tokenVerification: TokenVerification.Internal
    }
  }
}
