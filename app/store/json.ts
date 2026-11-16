import { defineStore } from 'pinia'
import { HttpClient } from '@injectivelabs/utils'
import {
  IS_DEVNET,
  IS_MAINNET,
  IS_TESTNET,
  MAINTENANCE_DISABLED
} from '../utils/constant'
import { tokenStaticFactory, getIndexerRestExplorerApi } from '../service'
import type {
  SpotMarket,
  TokenStatic,
  DerivativeMarket
} from '@injectivelabs/sdk-ts'
import type {
  JsonEvmToken,
  JsonValidator,
  JsonSwapRoute,
  JsonGridMarket,
  JsonSwapRouteRaw,
  JsonChainUpgrade,
  JsonHelixCategory
} from '../types'

// const CLOUD_FRONT_URL = 'https://d36789lqgasyke.cloudfront.net'
const STAGING_CLOUD_FRONT_URL = 'https://d1baot60r65stl.cloudfront.net'
const client = new HttpClient(STAGING_CLOUD_FRONT_URL, {
  headers: {
    'Cache-Control': 'max-age=0'
  }
})

export type JsonStoreState = {
  verifiedDenoms: string[]
  latestBlockHeight: number
  spotMarkets: SpotMarket[]
  swapRoutes: JsonSwapRoute[]
  validators: JsonValidator[]
  restrictedCountries: string[]
  blacklistedAddresses: string[]
  mainnetEvmTokens: JsonEvmToken[]
  testnetEvmTokens: JsonEvmToken[]
  spotGridMarkets: JsonGridMarket[]
  wasmQuery: Record<string, string[]>
  wasmExecute: Record<string, string[]>
  derivativeMarkets: DerivativeMarket[]
  helixMarketCategory: JsonHelixCategory
  derivativeGridMarkets: JsonGridMarket[]
  expiryMarketMap: Record<string, string>
  verifiedSpotMarketMap: Record<string, string>
  chainUpgradeConfig: undefined | JsonChainUpgrade
  verifiedDerivativeMarketMap: Record<string, string>
  blockHeightPollingMap: Record<number, null | NodeJS.Timeout>
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

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0

export const toChainUpgradeConfig = (
  raw: unknown
): undefined | JsonChainUpgrade => {
  if (!raw || typeof raw !== 'object') {
    return
  }

  const { proposalId, proposalMsg, blockHeight, disableMaintenance } =
    raw as Record<string, unknown>

  if (typeof proposalMsg !== 'string' || !proposalMsg.trim()) {
    return
  }

  if (!isPositiveInteger(blockHeight)) {
    return
  }

  return {
    proposalMsg,
    blockHeight,
    disableMaintenance: Boolean(disableMaintenance),
    proposalId: isPositiveInteger(proposalId) ? proposalId : undefined
  }
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
    latestBlockHeight: 0,
    mainnetEvmTokens: [],
    testnetEvmTokens: [],
    derivativeMarkets: [],
    restrictedCountries: [],
    blacklistedAddresses: [],
    verifiedSpotMarketMap: {},
    derivativeGridMarkets: [],
    blockHeightPollingMap: {},
    verifiedDerivativeMarketMap: {},
    chainUpgradeConfig: undefined,
    helixMarketCategory: {} as JsonHelixCategory
  }),

  getters: {
    expirySlugs: (state) => Object.keys(state.expiryMarketMap),

    expiryMarketIds: (state) => Object.values(state.expiryMarketMap),

    verifiedSpotSlugs: (state) => Object.keys(state.verifiedSpotMarketMap),

    verifiedSpotMarketIds: (state) =>
      Object.values(state.verifiedSpotMarketMap),

    verifiedDerivativeSlugs: (state) =>
      Object.keys(state.verifiedDerivativeMarketMap),
    verifiedDerivativeMarketIds: (state) =>
      Object.values(state.verifiedDerivativeMarketMap),

    helixMarketCategoriesMap: (state) =>
      Object.entries(state.helixMarketCategory).reduce(
        (list, [key, marketIdMap]: [string, { marketId: string }[]]) => {
          return {
            ...list,
            [key]: marketIdMap.map((item) => item.marketId)
          }
        },
        {} as Record<string, string[]>
      ),

    isPostUpgradeMode: ({ chainUpgradeConfig: config, latestBlockHeight }) =>
      !!config &&
      config.blockHeight < latestBlockHeight &&
      config.blockHeight + 2000 >= latestBlockHeight,

    hasUpcomingChainUpgrade: ({
      chainUpgradeConfig: config,
      latestBlockHeight
    }) =>
      !!config &&
      !MAINTENANCE_DISABLED &&
      !config.disableMaintenance &&
      config.blockHeight > latestBlockHeight,

    isMaintenanceMode: ({ chainUpgradeConfig: config, latestBlockHeight }) => {
      if (!config || MAINTENANCE_DISABLED || config.disableMaintenance) {
        return false
      }

      // 100 * 0.6 seconds per block ~= 1 minute before upgrade
      return (
        latestBlockHeight === 0 || config.blockHeight - 100 <= latestBlockHeight
      )
    }
  },

  actions: {
    async fetchToken() {
      const data = (await client.get(
        `json/tokens/verified/${getNetworkName()}`
      )) as {
        data: TokenStatic[]
      }

      tokenStaticFactory.mapRegistry(data.data)
    },

    async fetchFullTokenList() {
      const data = (await client.get(`json/tokens/${getNetworkName()}`)) as {
        data: TokenStatic[]
      }

      tokenStaticFactory.mapRegistry(data.data)
    },

    async fetchRestrictedCountries() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(`json/geo/countries.json`)) as {
        data: string[]
      }

      jsonStore.restrictedCountries = data.data
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

    async fetchValidators() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/validators/${getNetworkName()}`
      )) as {
        data: JsonValidator[]
      }

      jsonStore.validators = data.data
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

    async fetchSwapRoutes() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/helix/trading/swap/${getNetworkName()}`
      )) as {
        data: JsonSwapRouteRaw[]
      }

      jsonStore.swapRoutes = data.data.map((route) => {
        return {
          ...route,
          sourceDenom: route.source_denom,
          targetDenom: route.target_denom
        }
      })
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

    async fetchBlacklistedAddresses() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/wallets/ofacAndRestricted.json`
      )) as {
        data: string[]
      }

      jsonStore.blacklistedAddresses = data.data
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

    async fetchExpiryMarketMap() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/helix/trading/expiryMap/${getNetworkName()}`
      )) as {
        data: Record<string, string>
      }

      jsonStore.expiryMarketMap = data.data
    },

    async fetchSpotGridMarkets() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/helix/trading/gridMarkets/spot/${getNetworkName()}`
      )) as {
        data: JsonGridMarket[]
      }

      if (IS_DEVNET) {
        jsonStore.spotGridMarkets = data.data.map((item) => {
          const shouldOverride = item.slug === 'inj-usdt'

          if (!shouldOverride) {
            return item
          }

          return {
            slug: item.slug,
            contractAddress: 'inj14zykjnz94dr9nj4v2yzpvnlrw5uurk5hhea8xw'
          }
        })
      } else {
        jsonStore.spotGridMarkets = data.data
      }
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

    async fetchVerifiedSpotMarketMap() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/helix/trading/spotMap/${getNetworkName()}`
      )) as {
        data: Record<string, string>
      }

      jsonStore.verifiedSpotMarketMap = data.data
    },

    async fetchMarketCategoryMap() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/helix/trading/market/categoryMap/${getNetworkName()}`
      )) as {
        data: JsonHelixCategory
      }

      jsonStore.helixMarketCategory = data.data
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

    pollBlockHeight(heightToPoll: number) {
      const jsonStore = useSharedJsonStore()
      const POLL_INTERVAL = 10 * 1000

      if (jsonStore.blockHeightPollingMap[heightToPoll]) {
        return
      }

      const stopPolling = () => {
        if (jsonStore.blockHeightPollingMap[heightToPoll]) {
          clearInterval(jsonStore.blockHeightPollingMap[heightToPoll])
          jsonStore.blockHeightPollingMap[heightToPoll] = null
        }
      }

      const poll = async () => {
        const indexerRestExplorerApi = await getIndexerRestExplorerApi()

        const {
          paging: { total: latestBlockHeight }
        } = await indexerRestExplorerApi.fetchBlocks({ limit: 1 })

        jsonStore.latestBlockHeight = latestBlockHeight

        if (latestBlockHeight >= heightToPoll) {
          stopPolling()
        }
      }

      jsonStore.blockHeightPollingMap[heightToPoll] = setInterval(
        async () => await poll(),
        POLL_INTERVAL
      )
    },

    async fetchDerivativeGridMarkets() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        `json/helix/trading/gridMarkets/derivative/${getNetworkName()}`
      )) as {
        data: JsonGridMarket[]
      }

      const itslaGridMarket = {
        slug: 'itsla-usdt-perp',
        contractAddress: 'inj12l7llh5am4w4ecx87an6wsq97eyd0auj5cefcq'
      }

      const imcdGridMarket = {
        slug: 'imcd-usdt-perp',
        contractAddress: 'inj1r96zu3wgcnwvdvhmz73sxqz430luaudmddf7ua'
      }

      const opGridMarket = {
        slug: 'op-usdt-perp',
        contractAddress: 'inj1nm4ajyrlyqqhgzf32dvywgvshewyaw53rlwdfg'
      }

      if (IS_MAINNET) {
        data.data.push(itslaGridMarket, imcdGridMarket, opGridMarket)
      }

      jsonStore.derivativeGridMarkets = data.data
    },

    async fetchEvmTokens() {
      const jsonStore = useSharedJsonStore()

      const mainnetTokens = (await client.get(
        `json/tokens/evm/mainnet.json`
      )) as {
        data: JsonEvmToken[]
      }
      const testnetTokens = (await client.get(
        `json/tokens/evm/mainnet.json`
      )) as {
        data: JsonEvmToken[]
      }

      jsonStore.mainnetEvmTokens = mainnetTokens.data
      jsonStore.testnetEvmTokens = testnetTokens.data
    },

    async fetchChainUpgradeConfig() {
      let latestBlockHeight = 0

      if (!IS_MAINNET) {
        return
      }

      const indexerRestExplorerApi = await getIndexerRestExplorerApi()

      const jsonStore = useSharedJsonStore()

      const { data } = (await client.get('json/config/chainUpgrade.json')) as {
        data: unknown
      }

      const config = toChainUpgradeConfig(data)

      try {
        const {
          paging: { total }
        } = await indexerRestExplorerApi.fetchBlocks({
          limit: 1
        })

        latestBlockHeight = total
        jsonStore.latestBlockHeight = latestBlockHeight
      } catch {
        // silently throw
      }

      if (!config) {
        return
      }

      if (config.blockHeight > latestBlockHeight) {
        jsonStore.pollBlockHeight(config.blockHeight + 2000)
      }

      jsonStore.chainUpgradeConfig = config
    }
  }
})
