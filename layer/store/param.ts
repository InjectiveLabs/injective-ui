import { defineStore } from 'pinia'
import {
  Pool,
  MinModuleParams as MintModuleParams
} from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { injToken } from './../data/token'
import { mintApi, bankApi, stakingApi } from './../Service'
import { sharedToBalanceInToken } from './../utils/formatter'

const ACTUAL_BLOCK_TIME = 0.75
const ACTUAL_BLOCKS_PER_YEAR = 42_048_000

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

      paramStore.$patch({
        actualBlockTime: ACTUAL_BLOCK_TIME,
        actualBlocksPerYear: ACTUAL_BLOCKS_PER_YEAR
      })
    }
  }
})
