import { defineStore } from 'pinia'
import { bffApi } from '../service/bff'
import { usdcToken } from '../data/token'
import { MARKET_IDS_TO_HIDE } from '../data/market'
import { derivativeCacheApi } from '../service/cache'
import { NETWORK, IS_HELIX, IS_TRUE_CURRENT } from '../utils/constant'
import {
  toUiMarketSummary,
  toZeroUiMarketSummary,
  sharedDerivativeGetSlugAndTicket
} from '../transformer/market'
import {
  ALL_MARKET_STATUSES,
  marketDefinitionsCache,
  getMarketDefinitionsCacheKey,
  shouldCacheMarketDefinitions,
  MARKET_DEFINITIONS_CACHE_TTL_MS
} from '../providers/marketDefinitionsCache'
import type { BffMarketStatus } from '../providers/marketDefinitionsCache'
import type {
  BffDerivativeMarket,
  SharedUiMarketSummary
} from '../types'

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
      this.markets = await getDerivativeMarkets()
    },

    async fetchAllMarkets() {
      this.markets = await getDerivativeMarkets(ALL_MARKET_STATUSES)
    },

    async fetchMarketsSummary() {
      const marketSummaries = await derivativeCacheApi.fetchMarketsSummary()

      const marketsWithoutMarketSummaries = this.markets.filter(
        ({ marketId }) => {
          return !marketSummaries.some(({ marketId: id }) => id === marketId)
        }
      )

      this.marketsSummary = [
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
    }
  }
})

function getDerivativeMarkets(marketStatuses?: BffMarketStatus[]) {
  return marketDefinitionsCache.cached({
    ttlMs: MARKET_DEFINITIONS_CACHE_TTL_MS,
    allowStaleOnError: true,
    shouldCacheValue: shouldCacheMarketDefinitions,
    key: getMarketDefinitionsCacheKey({
      marketStatuses,
      marketType: 'derivative'
    }),
    request: () => fetchDerivativeMarketsFromBff(marketStatuses)
  })
}

async function fetchDerivativeMarketsFromBff(
  marketStatuses?: BffMarketStatus[]
) {
  const endpoint = getDerivativeMarketsEndpoint()
  const { data } = marketStatuses
    ? await endpoint.get({
        params: {
          query: {
            network: NETWORK,
            marketStatus: marketStatuses
          }
        }
      })
    : await endpoint.get({
        params: { query: { network: NETWORK } }
      })

  return (data?.data || []).map((market) => ({
    ...market,
    ...sharedDerivativeGetSlugAndTicket(market)
  })) as BffDerivativeMarket[]
}

function getDerivativeMarketsEndpoint() {
  return IS_HELIX
    ? bffApi.api.v1.derivative.markets.helix
    : IS_TRUE_CURRENT
      ? bffApi.api.v1.derivative.markets.tc
      : bffApi.api.v1.derivative.markets
}
