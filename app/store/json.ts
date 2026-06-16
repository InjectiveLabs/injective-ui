import { defineStore } from 'pinia'
import { fetchCachedJson } from '../providers/jsonCache'
import { HttpClient, toBigNumber } from '@injectivelabs/utils'
import { getIndexerRestExplorerApi } from '../service/indexer'
import { tokenStaticFactory } from '../service/tokenStaticFactory'
import {
  IS_DEVNET,
  IS_MAINNET,
  IS_TESTNET,
  MAINTENANCE_DISABLED
} from '../utils/constant'
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

const fetchJson = <T>(path: string) => {
  return fetchCachedJson<T>({
    path,
    request: () => client.get(path) as Promise<{ data: T }>
  })
}

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
  chainUpgradeConfig: JsonChainUpgrade
  wasmExecute: Record<string, string[]>
  derivativeMarkets: DerivativeMarket[]
  helixMarketCategory: JsonHelixCategory
  derivativeGridMarkets: JsonGridMarket[]
  expiryMarketMap: Record<string, string>
  verifiedSpotMarketMap: Record<string, string>
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
    chainUpgradeConfig: {} as JsonChainUpgrade,
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

    isTradeFiMarket: (state) => (marketId: string) => {
      return (
        [
          ...state.helixMarketCategory.rwa,
          ...state.helixMarketCategory.stocks
        ].find((market) => market.marketId === marketId) !== undefined
      )
    },

    isSedaMarket: (state) => (marketId: string) => {
      return (
        state.helixMarketCategory.seda.find(
          (market) => market.marketId === marketId
        ) !== undefined
      )
    },

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

    isPostUpgradeMode: (state) => {
      const blockHeightInBigNumber = toBigNumber(
        state.chainUpgradeConfig?.blockHeight || 0
      )

      return (
        blockHeightInBigNumber.gt(0) &&
        blockHeightInBigNumber.lt(state.latestBlockHeight) &&
        blockHeightInBigNumber.plus(2000).gte(state.latestBlockHeight)
      )
    },
    hasUpcomingChainUpgrade: (state) => {
      const blockHeightInBigNumber = toBigNumber(
        state.chainUpgradeConfig?.blockHeight || 0
      )

      if (MAINTENANCE_DISABLED || state.chainUpgradeConfig.disableMaintenance) {
        return false
      }

      return (
        blockHeightInBigNumber.gt(0) &&
        blockHeightInBigNumber.gt(state.latestBlockHeight)
      )
    },

    isMaintenanceMode: (state) => {
      const blockHeightInBigNumber = toBigNumber(
        state.chainUpgradeConfig?.blockHeight || 0
      )

      if (blockHeightInBigNumber.isZero()) {
        return false
      }

      if (MAINTENANCE_DISABLED || state.chainUpgradeConfig.disableMaintenance) {
        return false
      }

      if (
        state.latestBlockHeight === 0 &&
        toBigNumber(state.chainUpgradeConfig.blockHeight).gt(0)
      ) {
        return true
      }

      return toBigNumber(state.chainUpgradeConfig.blockHeight)
        .minus(100) // 100 * 0.6 seconds per block ~= 1 minute before upgrade
        .lte(state.latestBlockHeight)
    }
  },

  actions: {
    async fetchToken() {
      const data = await fetchJson<TokenStatic[]>(
        `json/tokens/verified/${getNetworkName()}`
      )

      tokenStaticFactory.mapRegistry(data)
    },

    async fetchFullTokenList() {
      const data = await fetchJson<TokenStatic[]>(`json/tokens/${getNetworkName()}`)

      tokenStaticFactory.mapRegistry(data)
    },

    async fetchRestrictedCountries() {
      const jsonStore = useSharedJsonStore()

      const data = await fetchJson<string[]>('json/geo/countries.json')

      jsonStore.restrictedCountries = data
    },

    async fetchSpotMarkets() {
      const jsonStore = useSharedJsonStore()

      const data = await fetchJson<SpotMarket[]>(
        `json/market/spot/${getNetworkName()}`
      )

      jsonStore.spotMarkets = data
    },

    async fetchValidators() {
      const jsonStore = useSharedJsonStore()

      const data = await fetchJson<JsonValidator[]>(
        `json/validators/${getNetworkName()}`
      )

      jsonStore.validators = data
    },

    async fetchWasmQuery() {
      const jsonStore = useSharedJsonStore()

      const data = await fetchJson<Record<string, string[]>>(
        `json/wasm/query/${getNetworkName()}`
      )

      jsonStore.wasmQuery = data
    },

    async fetchSwapRoutes() {
      const jsonStore = useSharedJsonStore()

      const data = await fetchJson<JsonSwapRouteRaw[]>(
        `json/helix/trading/swap/${getNetworkName()}`
      )

      jsonStore.swapRoutes = data.map((route) => {
        return {
          ...route,
          sourceDenom: route.source_denom,
          targetDenom: route.target_denom
        }
      })
    },

    async fetchWasmExecute() {
      const jsonStore = useSharedJsonStore()

      const data = await fetchJson<Record<string, string[]>>(
        `json/wasm/execute/${getNetworkName()}`
      )

      jsonStore.wasmExecute = data
    },

    async fetchBlacklistedAddresses() {
      const jsonStore = useSharedJsonStore()

      const data = await fetchJson<string[]>('json/wallets/ofacAndRestricted.json')

      jsonStore.blacklistedAddresses = data
    },

    async fetchDerivativeMarkets() {
      const jsonStore = useSharedJsonStore()

      const data = await fetchJson<DerivativeMarket[]>(
        `json/market/derivative/${getNetworkName()}`
      )

      jsonStore.derivativeMarkets = data
    },

    async fetchExpiryMarketMap() {
      const jsonStore = useSharedJsonStore()

      const data = await fetchJson<Record<string, string>>(
        `json/helix/trading/expiryMap/${getNetworkName()}`
      )

      jsonStore.expiryMarketMap = data
    },

    async fetchSpotGridMarkets() {
      const jsonStore = useSharedJsonStore()

      const data = await fetchJson<JsonGridMarket[]>(
        `json/helix/trading/gridMarkets/spot/${getNetworkName()}`
      )

      if (IS_DEVNET) {
        jsonStore.spotGridMarkets = data.map((item) => {
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
        jsonStore.spotGridMarkets = data
      }
    },

    async fetchVerifiedDenoms() {
      const jsonStore = useSharedJsonStore()

      const data = await fetchJson<Record<string, any[]>>(
        `json/helix/trading/denoms/${getNetworkName()}`
      )

      jsonStore.verifiedDenoms = Object.keys(data)
    },

    async fetchVerifiedSpotMarketMap() {
      const jsonStore = useSharedJsonStore()

      const data = await fetchJson<Record<string, string>>(
        `json/helix/trading/spotMap/${getNetworkName()}`
      )

      jsonStore.verifiedSpotMarketMap = data
    },

    async fetchMarketCategoryMap() {
      const jsonStore = useSharedJsonStore()

      const data = await fetchJson<JsonHelixCategory>(
        `json/helix/trading/market/categoryMap/${getNetworkName()}`
      )

      jsonStore.helixMarketCategory = data
    },

    async fetchVerifiedDerivativeMarketMap() {
      const jsonStore = useSharedJsonStore()

      const data = await fetchJson<Record<string, string>>(
        `json/helix/trading/derivativeMap/${getNetworkName()}`
      )

      jsonStore.verifiedDerivativeMarketMap = data
    },

    pollBlockHeight(heightToPoll: number) {
      const jsonStore = useSharedJsonStore()
      const POLL_INTERVAL = 10 * 1000

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

      const data = await fetchJson<JsonGridMarket[]>(
        `json/helix/trading/gridMarkets/derivative/${getNetworkName()}`
      )

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

      jsonStore.derivativeGridMarkets = IS_MAINNET
        ? [...data, itslaGridMarket, imcdGridMarket, opGridMarket]
        : data
    },

    async fetchEvmTokens() {
      const jsonStore = useSharedJsonStore()

      const mainnetTokens = await fetchJson<JsonEvmToken[]>(
        'json/tokens/evm/mainnet.json'
      )
      const testnetTokens = await fetchJson<JsonEvmToken[]>(
        'json/tokens/evm/mainnet.json'
      )

      jsonStore.mainnetEvmTokens = mainnetTokens
      jsonStore.testnetEvmTokens = testnetTokens
    },

    async fetchChainUpgradeConfig() {
      let latestBlockHeight = 0

      if (!IS_MAINNET) {
        return
      }

      const indexerRestExplorerApi = await getIndexerRestExplorerApi()

      const jsonStore = useSharedJsonStore()

      const config = await fetchJson<JsonChainUpgrade>(
        'json/config/chainUpgrade.json'
      )

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

      const isValidChainUpgradeConfig =
        !!config &&
        typeof config === 'object' &&
        typeof config.proposalId === 'number' &&
        config.proposalId > 0 &&
        typeof config.proposalMsg === 'string' &&
        config.proposalMsg.trim().length > 0 &&
        typeof config.blockHeight === 'number' &&
        config.blockHeight > 0

      if (!isValidChainUpgradeConfig) {
        return
      }

      if (config.blockHeight > latestBlockHeight) {
        jsonStore.pollBlockHeight(config.blockHeight + 2000)
      }

      jsonStore.chainUpgradeConfig = config
    }
  }
})
