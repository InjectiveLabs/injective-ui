import { defineStore } from 'pinia'
import { usdcToken } from '../data/token'
import { MARKET_IDS_TO_HIDE } from '../data/market'
import { NETWORK, IS_HELIX, IS_TRUE_CURRENT } from '../utils/constant'
import {
  toUiMarketSummary,
  toZeroUiMarketSummary,
  sharedDerivativeGetSlugAndTicket
} from '../transformer/market'
import { bffApi, derivativeCacheApi } from '../service'
import { SharedMarketStatus } from '../types'
import type { BffDerivativeMarket, SharedUiMarketSummary } from '../types'

type derivativeStore = {
  markets: BffDerivativeMarket[]
  marketsSummary: SharedUiMarketSummary[]
}

export const useSharedDerivativeStore = defineStore('sharedDerivative', {
  state: (): derivativeStore => ({
    markets: [],
    marketsSummary: []
  }),

  getters: {
    allMarketsWithToken: (state): BffDerivativeMarket[] =>
      state.markets.filter(
        (market) => !MARKET_IDS_TO_HIDE.includes(market.marketId)
      ),

    marketsWithToken(): BffDerivativeMarket[] {
      return this.allMarketsWithToken
    }
  },

  actions: {
    async fetchMarkets() {
      const endpoint = IS_HELIX
        ? bffApi.api.v1.derivative.markets.helix
        : IS_TRUE_CURRENT
          ? bffApi.api.v1.derivative.markets.tc
          : bffApi.api.v1.derivative.markets

      const { data } = await endpoint.get({
        params: { query: { network: NETWORK } }
      })

      this.markets = data?.data.map((market) => ({
        ...market,
        ...sharedDerivativeGetSlugAndTicket(market)
      })) as BffDerivativeMarket[]
    },

    async fetchAllMarkets() {
      const endpoint = IS_HELIX
        ? bffApi.api.v1.derivative.markets.helix
        : IS_TRUE_CURRENT
          ? bffApi.api.v1.derivative.markets.tc
          : bffApi.api.v1.derivative.markets

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
        ...sharedDerivativeGetSlugAndTicket(market)
      })) as BffDerivativeMarket[]
    },

    async fetchMarketsSummary() {
      const marketSummaries = await derivativeCacheApi.fetchMarketsSummary()

      const marketsWithoutMarketSummaries = this.markets.filter(
        ({ marketId }) => {
          return !marketSummaries.some(({ marketId: id }) => id === marketId)
        }
      )

      this.$patch({
        marketsSummary: [
          ...marketSummaries.map(toUiMarketSummary),
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
      })
    }
  }
})
