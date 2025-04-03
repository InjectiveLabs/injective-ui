import { defineStore } from 'pinia'
import type {
  SpotMarket,
  TokenStatic,
  DerivativeMarket
} from '@injectivelabs/sdk-ts'
import { HttpClient, BigNumberInBase } from '@injectivelabs/utils'
import { tokenStaticFactory, indexerRestExplorerApi } from '../Service'
import { IS_MAINNET, IS_TESTNET, MAINTENANCE_DISABLED } from '../utils/constant'
import type {
  JsonValidator,
  JsonSwapRoute,
  JsonGridMarket,
  JsonChainUpgrade,
  JsonHelixCategory
} from './../types'

const CLOUD_FRONT_URL = 'https://d36789lqgasyke.cloudfront.net'
const client = new HttpClient(CLOUD_FRONT_URL)

export type JsonStoreState = {
  verifiedDenoms: string[]
  latestBlockHeight: number
  spotMarkets: SpotMarket[]
  swapRoutes: JsonSwapRoute[]
  validators: JsonValidator[]
  restrictedCountries: string[]
  blacklistedAddresses: string[]
  spotGridMarkets: JsonGridMarket[]
  chainUpgradeConfig: JsonChainUpgrade
  wasmQuery: Record<string, string[]>
  wasmExecute: Record<string, string[]>
  derivativeMarkets: DerivativeMarket[]
  derivativeGridMarkets: JsonGridMarket[]
  expiryMarketMap: Record<string, string>
  helixMarketCategory: JsonHelixCategory
  verifiedSpotMarketMap: Record<string, string>
  verifiedDerivativeMarketMap: Record<string, string>
  blockHeightPollingMap: Record<number, NodeJS.Timeout | null>
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
    isTradeFiMarket: (state) => (marketId: string) => {
      return (
        [
          ...state.helixMarketCategory.rwa,
          ...state.helixMarketCategory.iAssets
        ].find((market) => market.marketId === marketId) !== undefined
      )
    },
    isMaintenanceMode: (state) => {
      const blockHeightInBigNumber = new BigNumberInBase(
        state.chainUpgradeConfig?.blockHeight || 0
      )

      if (blockHeightInBigNumber.isZero()) {
        return false
      }

      if (MAINTENANCE_DISABLED || state.chainUpgradeConfig.disableMaintenance) {
        return false
      }

      return new BigNumberInBase(state.chainUpgradeConfig.blockHeight)
        .minus(500)
        .lte(state.latestBlockHeight)
    },

    hasUpcomingChainUpgrade: (state) => {
      const blockHeightInBigNumber = new BigNumberInBase(
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

    isPostUpgradeMode: (state) => {
      const blockHeightInBigNumber = new BigNumberInBase(
        state.chainUpgradeConfig?.blockHeight || 0
      )

      return (
        blockHeightInBigNumber.gt(0) &&
        blockHeightInBigNumber.lt(state.latestBlockHeight) &&
        blockHeightInBigNumber.plus(2000).gte(state.latestBlockHeight)
      )
    },

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
    },

    async fetchRestrictedCountries() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get('json/geo/countries.json')) as {
        data: string[]
      }

      jsonStore.restrictedCountries = data.data
    },

    async fetchBlacklistedAddresses() {
      const jsonStore = useSharedJsonStore()

      const data = (await client.get(
        'json/wallets/ofacAndRestricted.json'
      )) as {
        data: string[]
      }

      jsonStore.blacklistedAddresses = data.data
    },

    async fetchChainUpgradeConfig() {
      if (!IS_MAINNET) {
        return
      }

      const jsonStore = useSharedJsonStore()

      const {
        paging: { total: latestBlockHeight }
      } = await indexerRestExplorerApi.fetchBlocks({
        limit: 1
      })

      jsonStore.latestBlockHeight = latestBlockHeight

      // todo: replace with cloudfront link when features is ready to roll out to prod
      // @ts-ignore
      const client = new HttpClient(
        'https://raw.githubusercontent.com/InjectiveLabs/injective-lists/feat/chain-upgrade/json/config'
      )

      const { data: config } = (await client.get('chainUpgrade.json')) as {
        data: JsonChainUpgrade
      }

      console.log('fetchChainUpgradeConfig', { config, latestBlockHeight })

      const isValidChainUpgradeConfig =
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
    }
  }
})
