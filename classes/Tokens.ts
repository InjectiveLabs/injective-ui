import { unknownToken } from '../data/token'
import { TokenVerification } from '@injectivelabs/sdk-ts/types'
/**
 * @deprecated Use subpath imports from '@injectivelabs/sdk-ts/service' instead.
 * TokenFactoryStatic is temporarily imported from the barrel until all apps migrate.
 */
import { TokenFactoryStatic } from '@injectivelabs/sdk-ts/service'
import { tokenCacheApi, sharedTokenClient } from '../Service'
import type { Coin, TokenStatic } from '@injectivelabs/sdk-ts'
import type { SharedBalanceWithToken } from '../types'

export const sharedGetToken = async (
  tokenFactoryStatic: TokenFactoryStatic,
  denomOrSymbol: string
): Promise<undefined | TokenStatic> => {
  const token = tokenFactoryStatic.toToken(denomOrSymbol)

  if (token) {
    return token
  }

  const asyncToken = await sharedTokenClient.queryToken(denomOrSymbol)

  return asyncToken
}

export class SharedTokens {
  public state: {
    tokens: TokenStatic[]
    unknownTokens: TokenStatic[]
    assets: SharedBalanceWithToken[]
    supplyMap: Record<string, string>
    unknownAssets: SharedBalanceWithToken[]
  } = {
    tokens: [],
    unknownTokens: [],
    assets: [],
    unknownAssets: [],
    supplyMap: {}
  }

  private tokenFactoryStatic: TokenFactoryStatic

  private shouldFetchUnknownTokens = true

  constructor(tokens: TokenStatic[], shouldFetchUnknownTokens = true) {
    this.tokenFactoryStatic = new TokenFactoryStatic(tokens)
    this.shouldFetchUnknownTokens = shouldFetchUnknownTokens
  }

  async fetchAssets() {
    const { state, shouldFetchUnknownTokens, tokenFactoryStatic } = this

    if (state.assets.length > 0) {
      return
    }

    const { supply } = await tokenCacheApi.fetchTotalSupply()
    const supplyMap = supply.reduce(
      (map, coin) => {
        map[coin.denom] = coin.amount

        return map
      },
      {} as Record<string, string>
    )

    const { balancesWithTokens, unknownCoins } = supply.reduce(
      (list, coin) => {
        const token = tokenFactoryStatic.toToken(coin.denom)

        if (!token) {
          list.unknownCoins.push(coin)

          return list
        }

        list.balancesWithTokens.push({
          denom: coin.denom,
          balance: coin.amount,
          token
        })

        return list
      },
      { balancesWithTokens: [], unknownCoins: [] } as {
        unknownCoins: Coin[]
        balancesWithTokens: SharedBalanceWithToken[]
      }
    )

    const unknownAssets = [] as SharedBalanceWithToken[]

    for (const coin of unknownCoins) {
      if (!shouldFetchUnknownTokens) {
        continue
      }

      const token = await sharedGetToken(tokenFactoryStatic, coin.denom)

      unknownAssets.push({
        denom: coin.denom,
        balance: coin.amount,
        token: token || {
          ...unknownToken,
          denom: coin.denom,
          address: coin.denom
        }
      })
    }

    const verificationStatusSortOrder = [
      TokenVerification.Verified,
      TokenVerification.Internal,
      TokenVerification.External,
      TokenVerification.Unverified
    ]

    const sortedBalancesWithTokens = balancesWithTokens.sort((a, b) => {
      return (
        verificationStatusSortOrder.indexOf(a.token.tokenVerification) -
        verificationStatusSortOrder.indexOf(b.token.tokenVerification)
      )
    })

    this.state = {
      ...state,
      supplyMap,
      unknownAssets,
      assets: sortedBalancesWithTokens
    }
  }

  async fetchTokens() {
    const { state, shouldFetchUnknownTokens, tokenFactoryStatic } = this

    if (state.tokens.length > 0) {
      return
    }

    const { supply } = await tokenCacheApi.fetchTotalSupply()

    const { tokens, unknownCoins } = supply.reduce(
      (list, coin) => {
        const token = tokenFactoryStatic.toToken(coin.denom)

        if (!token) {
          list.unknownCoins.push(coin)

          return list
        }

        list.tokens.push(token)

        return list
      },
      { tokens: [], unknownCoins: [] } as {
        unknownCoins: Coin[]
        tokens: TokenStatic[]
      }
    )

    const unknownTokens = [] as TokenStatic[]

    for (const coin of unknownCoins) {
      if (!shouldFetchUnknownTokens) {
        continue
      }

      const token = await sharedGetToken(tokenFactoryStatic, coin.denom)

      unknownTokens.push(token || unknownToken)
    }

    this.state = {
      ...state,
      tokens,
      unknownTokens
    }
  }
}
