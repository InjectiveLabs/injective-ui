import { defineStore } from 'pinia'
import {
  Pool,
  MinModuleParams as MintModuleParams
} from '@injectivelabs/sdk-ts'
import { HttpClient, BigNumberInBase } from '@injectivelabs/utils'
import { injToken } from './../data/token'
import { mintApi, bankApi, stakingApi } from './../Service'
import { sharedToBalanceInToken } from './../utils/formatter'

const ACTUAL_BLCOk_TIME = 0.625194000005722
const ACTUAL_BLOCKS_PER_YEAR = 50441942.82048672

type ParamStoreState = {
  injSupply: string
  baseInflation: string
  bondedTokens: string
  blocksPerYear: string
  actualBlockTime: number
  actualBlocksPerYear: number
  pool: Pool
  mintParams: MintModuleParams
}

const initialStateFactory = (): ParamStoreState => ({
  injSupply: '0',
  baseInflation: '0',
  bondedTokens: '0',
  blocksPerYear: '0',
  actualBlockTime: 0,
  actualBlocksPerYear: 0,
  pool: {} as Pool,
  mintParams: {} as MintModuleParams
})

export const useSharedParamStore = defineStore('sharedParam', {
  state: (): ParamStoreState => initialStateFactory(),
  getters: {
    apr: (state) => {
      return new BigNumberInBase(state.actualBlocksPerYear)
        .dividedBy(state.blocksPerYear)
        .times(state.baseInflation)
        .times(state.injSupply)
        .div(state.bondedTokens)
    }
  },
  actions: {
    async init() {
      await Promise.all([
        this.fetchSupply(),
        this.fetchInflation(),
        this.fetchPool(),
        this.fetchMintParams(),
        this.fetchChainParams()
      ])
    },

    async fetchSupply() {
      const paramsStore = useSharedParamStore()

      const injSupply = await bankApi.fetchSupplyOf(injToken.denom)

      paramsStore.$patch({
        injSupply: sharedToBalanceInToken({ value: injSupply.amount })
      })
    },

    async fetchInflation() {
      const paramsStore = useSharedParamStore()

      const { inflation } = await mintApi.fetchInflation()

      paramsStore.$patch({
        baseInflation: inflation
      })
    },

    async fetchPool() {
      const paramsStore = useSharedParamStore()

      const pool = await stakingApi.fetchPool()

      paramsStore.$patch({
        pool,
        bondedTokens: pool.bondedTokens
      })
    },

    async fetchMintParams() {
      const paramsStore = useSharedParamStore()

      const mintParams = await mintApi.fetchModuleParams()

      paramsStore.$patch({
        mintParams,
        blocksPerYear: mintParams.blocksPerYear
      })
    },

    async fetchChainParams() {
      const paramStore = useSharedParamStore()

      const httpClient = new HttpClient('https://chains.cosmos.directory/')

      try {
        const { data } = (await httpClient.get('injective')) as {
          data: {
            chain: {
              params: {
                actual_block_time: number
                actual_blocks_per_year: number
              }
            }
          }
        }

        paramStore.$patch({
          actualBlockTime: data.chain.params.actual_block_time,
          actualBlocksPerYear: data.chain.params.actual_blocks_per_year
        })
      } catch (error: any) {
        // silently throw
        paramStore.$patch({
          actualBlockTime: ACTUAL_BLCOk_TIME,
          actualBlocksPerYear: ACTUAL_BLOCKS_PER_YEAR
        })
      }
    }
  }
})
