import { defineStore } from 'pinia'
import {
  SpotMarket,
  TokenStatic,
  DerivativeMarket
} from '@injectivelabs/sdk-ts'
import { HttpClient } from '@injectivelabs/utils'
import { IS_MAINNET, IS_TESTNET } from '../utils/constant'
import { tokenStaticFactory } from '../Service'
import {
  type JsonValidator,
  type JsonSwapRoute,
  type JsonGridMarket,
  type JsonHelixCategory
} from './../types'

const CLOUD_FRONT_URL = 'https://d36789lqgasyke.cloudfront.net'
const client = new HttpClient(CLOUD_FRONT_URL)

export type JsonStoreState = {
  verifiedDenoms: string[]
  spotMarkets: SpotMarket[]
  swapRoutes: JsonSwapRoute[]
  validators: JsonValidator[]
  spotGridMarkets: JsonGridMarket[]
  wasmQuery: Record<string, string[]>
  wasmExecute: Record<string, string[]>
  derivativeMarkets: DerivativeMarket[]
  derivativeGridMarkets: JsonGridMarket[]
  expiryMarketMap: Record<string, string>
  helixMarketCategory: JsonHelixCategory
  verifiedSpotMarketMap: Record<string, string>
  verifiedDerivativeMarketMap: Record<string, string>
}

const getNetworkName = () => {
  if (IS_MAINNET) {
    return 'mainnet.json'
  }

  if (IS_TESTNET) {
    return 'testnet.json'
  }

  return 'devnet.json'
}

export const useSharedJsonStore = defineStore('sharedJson', {
  state: (): JsonStoreState => ({
    wasmQuery: {},
    swapRoutes: [],
    validators: [],
    spotMarkets: [],
    wasmExecute: {},
    verifiedDenoms: [],
    spotGridMarkets: [],
    expiryMarketMap: {},
    derivativeMarkets: [],
    verifiedSpotMarketMap: {},
    derivativeGridMarkets: [],
    verifiedDerivativeMarketMap: {},
    helixMarketCategory: {} as JsonHelixCategory
  }),

  getters: {
    verifiedSpotMarketIds: (state) =>
      Object.values(state.verifiedSpotMarketMap),
    verifiedSpotSlugs: (state) => Object.keys(state.verifiedSpotMarketMap),

    verifiedDerivativeSlugs: (state) =>
      Object.keys(state.verifiedDerivativeMarketMap),
    verifiedDerivativeMarketIds: (state) =>
      Object.values(state.verifiedDerivativeMarketMap),

    expirySlugs: (state) => Object.keys(state.expiryMarketMap),
    expiryMarketIds: (state) => Object.values(state.expiryMarketMap),

    helixMarketCategoriesMap: (state) =>
      Object.entries(state.helixMarketCategory).reduce(
        (list, [key, marketIdMap]: [string, { marketId: string }[]]) => {
          return {
            ...list,
            [key]: marketIdMap.map((item) => item.marketId)
          }
        },
        {} as Record<string, string[]>
      )
  },

  actions: {
    async fetchToken() {
      const data = (await client.get(`json/tokens/${getNetworkName()}`)) as {
        data: TokenStatic[]
      }

      tokenStaticFactory.mapRegistry(data.data)
    },

    async fetchSpotMarkets() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/market/spot/${getNetworkName()}`
      )) as {
        data: SpotMarket[]
      }

      jsonStore.spotMarkets = data.data
    },

    async fetchDerivativeMarkets() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/market/derivative/${getNetworkName()}`
      )) as {
        data: DerivativeMarket[]
      }

      jsonStore.derivativeMarkets = data.data
    },

    async fetchValidators() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/validators/${getNetworkName()}`
      )) as {
        data: JsonValidator[]
      }

      jsonStore.validators = data.data
    },

    async fetchVerifiedDenoms() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/helix/trading/denoms/${getNetworkName()}`
      )) as {
        data: Record<string, any[]>
      }

      jsonStore.verifiedDenoms = Object.keys(data.data)
    },

    async fetchWasmQuery() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/wasm/query/${getNetworkName()}`
      )) as {
        data: Record<string, string[]>
      }

      jsonStore.wasmQuery = data.data
    },

    async fetchWasmExecute() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/wasm/execute/${getNetworkName()}`
      )) as {
        data: Record<string, string[]>
      }

      jsonStore.wasmExecute = data.data
    },

    async fetchSwapRoutes() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/helix/trading/swap/${getNetworkName()}`
      )) as {
        data: JsonSwapRoute[]
      }

      jsonStore.swapRoutes = data.data
    },

    async fetchSpotGridMarkets() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/helix/trading/gridMarkets/spot/${getNetworkName()}`
      )) as {
        data: JsonGridMarket[]
      }

      jsonStore.spotGridMarkets = data.data
    },

    async fetchDerivativeGridMarkets() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/helix/trading/gridMarkets/derivative/${getNetworkName()}`
      )) as {
        data: JsonGridMarket[]
      }

      jsonStore.derivativeGridMarkets = data.data
    },

    async fetchVerifiedSpotMarketMap() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/helix/trading/spotMap/${getNetworkName()}`
      )) as {
        data: Record<string, string>
      }

      jsonStore.verifiedSpotMarketMap = data.data
    },

    async fetchVerifiedDerivativeMarketMap() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/helix/trading/derivativeMap/${getNetworkName()}`
      )) as {
        data: Record<string, string>
      }

      jsonStore.verifiedDerivativeMarketMap = data.data
    },

    async fetchExpiryMarketMap() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/helix/trading/expiryMap/${getNetworkName()}`
      )) as {
        data: Record<string, string>
      }

      jsonStore.expiryMarketMap = data.data
    },

    async fetchMarketCategoryMap() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/helix/trading/market/categoryMap/${getNetworkName()}`
      )) as {
        data: JsonHelixCategory
      }

      jsonStore.helixMarketCategory = data.data
    }
  }
})
