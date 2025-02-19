import { sharedTokenClient, tokenCacheApi } from '../Service'
import { unknownToken } from '../data/token'
import { type SharedBalanceWithToken } from '../types'
import {
  TokenFactoryStatic,
  type TokenStatic,
  type Coin
} from '@injectivelabs/sdk-ts'

export class SharedTokens {
  private tokenFactoryStatic: TokenFactoryStatic

  private shouldFetchUnknownTokens = true

  public state: {
    tokens: TokenStatic[]
    unknownTokens: TokenStatic[]
    assets: SharedBalanceWithToken[]
    unknownAssets: SharedBalanceWithToken[]
    supplyMap: Record<string, string>
  } = {
    tokens: [],
    unknownTokens: [],
    assets: [],
    unknownAssets: [],
    supplyMap: {}
  }

  constructor(tokens: TokenStatic[], shouldFetchUnknownTokens = true) {
    this.tokenFactoryStatic = new TokenFactoryStatic(tokens)
    this.shouldFetchUnknownTokens = shouldFetchUnknownTokens
  }

  async getToken(denomOrSymbol: string): Promise<TokenStatic | undefined> {
    const { tokenFactoryStatic } = this

    const token = tokenFactoryStatic.toToken(denomOrSymbol)

    if (token) {
      return token
    }

    const asyncToken = await sharedTokenClient.queryToken(denomOrSymbol)

    return asyncToken
  }

  async fetchTokens() {
    const { state, shouldFetchUnknownTokens, tokenFactoryStatic, getToken } =
      this

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
        tokens: TokenStatic[]
        unknownCoins: Coin[]
      }
    )

    const unknownTokens = [] as TokenStatic[]

    for (const coin of unknownCoins) {
      if (!shouldFetchUnknownTokens) {
        continue
      }

      const token = await getToken(coin.denom)

      unknownTokens.push(token || unknownToken)
    }

    this.state = {
      ...state,
      tokens,
      unknownTokens
    }
  }

  async fetchAssets() {
    const { state, shouldFetchUnknownTokens, tokenFactoryStatic, getToken } =
      this

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
        balancesWithTokens: SharedBalanceWithToken[]
        unknownCoins: Coin[]
      }
    )

    const unknownAssets = [] as SharedBalanceWithToken[]

    for (const coin of unknownCoins) {
      if (!shouldFetchUnknownTokens) {
        continue
      }

      const token = await getToken(coin.denom)

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

    this.state = {
      ...state,
      supplyMap,
      unknownAssets,
      assets: balancesWithTokens
    }
  }
}
