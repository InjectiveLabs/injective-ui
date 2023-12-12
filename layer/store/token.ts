import { defineStore } from 'pinia'
import {
  Token,
  TokenType,
  TokenVerification
} from '@injectivelabs/token-metadata'
import { bankApi } from '@shared/Service'
import { tokenPrice, denomClientAsync } from './../Service'

type TokenStoreState = {
  tokens: Token[]
  cw20Tokens: Token[] // mito cw20 token | token metadata
  tokenUsdPriceMap: Record<string, number>
}

const initialStateFactory = (): TokenStoreState => ({
  tokens: [],
  cw20Tokens: [],
  tokenUsdPriceMap: {}
})

export const useSharedTokenStore = defineStore('sharedToken', {
  state: (): TokenStoreState => initialStateFactory(),
  actions: {
    appendCw20Token(token: Partial<Token>) {
      const tokenStore = useSharedTokenStore()

      const tokenExistInStore = tokenStore.cw20Tokens.some(
        ({ denom }) => denom === token.denom
      )

      if (!tokenExistInStore) {
        tokenStore.$patch({
          cw20Tokens: [
            ...tokenStore.cw20Tokens,
            {
              ...token,
              tokenType: TokenType.Cw20,
              tokenVerification: TokenVerification.Verified
            }
          ]
        })
      }
    },

    async fetchTokenUsdPriceMap(coinGeckoIdList: string[]) {
      const tokenStore = useSharedTokenStore()
      const tokenUsdPriceList = await Promise.all(
        coinGeckoIdList.map(async (coinGeckoId) => {
          const usdPrice = 0

          try {
            return {
              [coinGeckoId]: await tokenPrice.fetchUsdTokenPrice(coinGeckoId)
            }
          } catch (e) {
            return {
              [coinGeckoId]: usdPrice
            }
          }
        })
      )

      const tokenUsdPriceMap = tokenUsdPriceList.reduce(
        (prices, tokenUsdPriceMap) => Object.assign(prices, tokenUsdPriceMap),
        {}
      )

      tokenStore.$patch({
        tokenUsdPriceMap: {
          ...tokenStore.tokenUsdPriceMap,
          ...tokenUsdPriceMap
        }
      })
    },

    async fetchSupplyTokenMeta() {
      const tokenStore = useSharedTokenStore()

      const { supply } = await bankApi.fetchTotalSupply({ limit: 1000 })

      const supplyWithTokensOrUnknown = supply.map((coin) =>
        denomClientAsync.getDenomTokenStaticOrUnknown(coin.denom)
      ) as Token[]

      tokenStore.$patch({
        tokens: supplyWithTokensOrUnknown.filter(
          (token) => token.tokenType !== TokenType.Unknown
        )
      })
    }
  }
})
