import { defineStore } from 'pinia'
import { usdcToken } from '../data/token'
import { MARKET_IDS_TO_HIDE } from '../data/market'
import { NETWORK, IS_HELIX, IS_TRUE_CURRENT } from '../utils/constant'
import {
  toUiMarketSummary,
  toZeroUiMarketSummary,
  sharedSpotGetSlugAndTicket
} from '../transformer/market'
import { bffApi, spotCacheApi } from '../service'
import { SharedMarketStatus } from '../types'
import type { BffSpotMarket, SharedUiMarketSummary } from '../types'

export type SpotStoreState = {
  markets: BffSpotMarket[]
  marketsSummary: SharedUiMarketSummary[]
}

export const useSharedSpotStore = defineStore('sharedSpot', {
  state: (): SpotStoreState => ({
    markets: [] as BffSpotMarket[],
    marketsSummary: []
  }),

  getters: {
    allMarketsWithToken: (state): BffSpotMarket[] =>
      state.markets.filter(
        (market) => !MARKET_IDS_TO_HIDE.includes(market.marketId)
      ),

    marketsWithToken(): BffSpotMarket[] {
      return this.allMarketsWithToken
    }
  },

  actions: {
    async fetchMarkets() {
      const endpoint = IS_HELIX
        ? bffApi.api.v1.spot.markets.helix
        : IS_TRUE_CURRENT
          ? bffApi.api.v1.spot.markets.tc
          : bffApi.api.v1.spot.markets

      const { data } = await endpoint.get({
        params: { query: { network: NETWORK } }
      })

      this.markets = data?.data.map((market) => ({
        ...market,
        ...sharedSpotGetSlugAndTicket(market)
      })) as BffSpotMarket[]
    },

    async fetchAllMarkets() {
      const endpoint = IS_HELIX
        ? bffApi.api.v1.spot.markets.helix
        : IS_TRUE_CURRENT
          ? bffApi.api.v1.spot.markets.tc
          : bffApi.api.v1.spot.markets

      const { data } = await endpoint.get({
        params: {
          query: {
            network: NETWORK,
            marketStatus: [
              SharedMarketStatus.Active,
              SharedMarketStatus.Paused,
              SharedMarketStatus.Expired,
              SharedMarketStatus.Suspended,
              SharedMarketStatus.Demolished
            ]
          }
        }
      })

      this.markets = data?.data.map((market) => ({
        ...market,
        ...sharedSpotGetSlugAndTicket(market)
      })) as BffSpotMarket[]
    },

    async fetchMarketsSummary() {
      const marketsSummaries = (await spotCacheApi.fetchMarketsSummary()) || []

      const marketsWithoutMarketSummaries = this.markets.filter(
        ({ marketId }) =>
          !marketsSummaries.some(({ marketId: id }) => id === marketId)
      )

      this.marketsSummary = [
        ...marketsSummaries.map(toUiMarketSummary),
        ...marketsWithoutMarketSummaries.map(({ marketId }) =>
          toZeroUiMarketSummary(marketId)
        )
      ].filter((marketSummary) => {
        if (!IS_TRUE_CURRENT) {
          return true
        }

        const market = this.markets.find(
          (m) => m.marketId === marketSummary.marketId
        )

        return market?.quoteDenom === usdcToken.denom
      })
    }
  }
})
