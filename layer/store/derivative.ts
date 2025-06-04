import { defineStore } from 'pinia'
import { MARKET_IDS_TO_HIDE } from './../data/market'
import {
  toUiMarketSummary,
  toUiDerivativeMarket,
  toZeroUiMarketSummary,
  sharedGetDerivativeSlugOverride
} from './../transformer/market'
import { SharedMarketStatus } from './../types'
import { derivativeCacheApi } from './../Service'
import type { PerpetualMarket } from '@injectivelabs/sdk-ts'
import type { SharedUiMarketSummary, SharedUiDerivativeMarket } from '../types'

export type derivativeStore = {
  markets: PerpetualMarket[]
  marketsSummary: SharedUiMarketSummary[]
}

export const useSharedDerivativeStore = defineStore('sharedDerivative', {
  state: (): derivativeStore => ({
    markets: [] as PerpetualMarket[],
    marketsSummary: []
  }),

  getters: {
    marketsWithToken: (state): SharedUiDerivativeMarket[] => {
      const jsonStore = useSharedJsonStore()
      const tokenStore = useSharedTokenStore()

      const uiMarkets = state.markets.map((market) => {
        const slug = sharedGetDerivativeSlugOverride({
          ticker: market.ticker,
          marketId: market.marketId
        })

        const [baseTokenSymbol] = slug.split('-')
        const baseToken = tokenStore.tokenByDenomOrSymbol(
          baseTokenSymbol.toUpperCase()
        )
        const quoteToken = tokenStore.tokenByDenomOrSymbol(market.quoteDenom)

        if (!baseToken || !quoteToken) {
          return undefined
        }

        const formattedMarket = toUiDerivativeMarket({
          slug,
          market,
          baseToken,
          quoteToken
        })

        return {
          ...formattedMarket,
          isVerified: [
            ...jsonStore.expiryMarketIds,
            ...jsonStore.verifiedDerivativeMarketIds
          ].includes(market.marketId)
        }
      })

      return uiMarkets.filter(
        (market) =>
          market &&
          !MARKET_IDS_TO_HIDE.includes(market.marketId) &&
          market.marketStatus === SharedMarketStatus.Active
      ) as SharedUiDerivativeMarket[]
    }
  },

  actions: {
    async fetchMarkets() {
      const derivativeStore = useSharedDerivativeStore()

      const markets =
        (await derivativeCacheApi.fetchMarkets()) as PerpetualMarket[]

      derivativeStore.markets = markets
    },

    async fetchMarketsSummary() {
      const derivativeStore = useSharedDerivativeStore()

      const marketSummaries = await derivativeCacheApi.fetchMarketsSummary()

      const marketsWithoutMarketSummaries = derivativeStore.markets.filter(
        ({ marketId }) =>
          !marketSummaries.some(({ marketId: id }) => id === marketId)
      )

      derivativeStore.$patch({
        marketsSummary: [
          ...marketSummaries.map(toUiMarketSummary),
          ...marketsWithoutMarketSummaries.map(({ marketId }) =>
            toZeroUiMarketSummary(marketId)
          )
        ]
      })
    }
  }
})
