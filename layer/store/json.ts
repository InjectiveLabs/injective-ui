import { defineStore } from 'pinia'
import {
  SpotMarket,
  TokenStatic,
  DerivativeMarket
} from '@injectivelabs/sdk-ts'
import { HttpClient } from '@injectivelabs/utils'
import { IS_MAINNET, IS_TESTNET } from '../utils/constant'
import { tokenStaticFactory } from '../Service'
import { type JsonValidator } from './../types'

const CLOUD_FRONT_URL = 'https://d36789lqgasyke.cloudfront.net'
const client = new HttpClient(CLOUD_FRONT_URL)

export type JsonStoreState = {
  verifiedDenoms: string[]
  spotMarkets: SpotMarket[]
  validators: JsonValidator[]
  wasmQuery: Record<string, string[]>
  wasmExecute: Record<string, string[]>
  derivativeMarkets: DerivativeMarket[]
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
    validators: [],
    spotMarkets: [],
    wasmExecute: {},
    verifiedDenoms: [],
    derivativeMarkets: []
  }),

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
    }
  }
})
