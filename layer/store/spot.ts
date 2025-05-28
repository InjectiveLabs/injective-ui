import { defineStore } from 'pinia'
import { MARKET_IDS_TO_HIDE } from './../data/market'
import {
  toUiSpotMarket,
  toUiMarketSummary,
  toZeroUiMarketSummary
} from './../transformer/market'
import { spotCacheApi } from './../Service'
import { SharedMarketStatus } from './../types'
import type { SpotMarket } from '@injectivelabs/sdk-ts'
import type { SharedUiSpotMarket, SharedUiMarketSummary } from './../types'

export type SpotStoreState = {
  markets: SpotMarket[]
  marketsSummary: SharedUiMarketSummary[]
}

export const useSharedSpotStore = defineStore('sharedSpot', {
  state: (): SpotStoreState => ({
    markets: [] as SpotMarket[],
    marketsSummary: []
  }),

  getters: {
    marketsWithToken: (state): SharedUiSpotMarket[] => {
      const jsonStore = useSharedJsonStore()
      const tokenStore = useSharedTokenStore()

      const uiMarkets = state.markets.map((market) => {
        const baseToken = tokenStore.tokenByDenomOrSymbol(market.baseDenom)
        const quoteToken = tokenStore.tokenByDenomOrSymbol(market.quoteDenom)

        if (!baseToken || !quoteToken) {
          return undefined
        }

        const formattedMarket = toUiSpotMarket({
          market,
          baseToken,
          quoteToken
        })

        return {
          ...formattedMarket,
          isVerified: jsonStore.verifiedSpotMarketIds.includes(market.marketId)
        } as SharedUiSpotMarket
      })

      return uiMarkets.filter(
        (market) =>
          market &&
          !MARKET_IDS_TO_HIDE.includes(market.marketId) &&
          market.marketStatus === SharedMarketStatus.Active
      ) as SharedUiSpotMarket[]
    }
  },

  actions: {
    async fetchMarkets() {
      const spotStore = useSharedSpotStore()

      const markets = await spotCacheApi.fetchMarkets()

      spotStore.markets = markets
    },

    async fetchMarketsSummary() {
      const sharedSpotStore = useSharedSpotStore()

      const marketsSummaries = (await spotCacheApi.fetchMarketsSummary()) || []

      const uiMarketSummaries = marketsSummaries.map((marketSummary) => {
        const marketExistInStore = sharedSpotStore.marketsWithToken.some(
          (market) => market.marketId === marketSummary.marketId
        )

        return marketExistInStore
          ? toUiMarketSummary(marketSummary)
          : toZeroUiMarketSummary(marketSummary.marketId)
      })

      sharedSpotStore.marketsSummary = uiMarketSummaries
    }
  }
})
