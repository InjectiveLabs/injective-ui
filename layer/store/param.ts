import { defineStore } from 'pinia'
import {
  Pool,
  DistributionModuleParams,
  MinModuleParams as MintModuleParams
} from '@injectivelabs/sdk-ts'
import { HttpClient, BigNumberInBase } from '@injectivelabs/utils'
import { injToken } from './../data/token'
import { mintApi, bankApi, stakingApi } from './../Service'
import { sharedToBalanceInToken } from './../utils/formatter'

const ON_CHAIN_BLOCK_TIME = 0.75
const ON_CHAIN_BLOCKS_PER_YEAR = 42_048_000
const ON_CHAIN_INFLATION = 0.88
const ON_CHAIN_COMMUNITY_TAX = 0.05

type ParamStoreState = {
  injSupply: string
  baseInflation: string
  bondedTokens: string
  communityTax: string
  blocksPerYear: string
  currentBlockTime: number
  currentBlocksPerYear: number
  actualBlockTime: number
  actualBlocksPerYear: number
  pool: Pool
  mintParams: MintModuleParams
  distributionParams: DistributionModuleParams
}

const initialStateFactory = (): ParamStoreState => ({
  injSupply: '0',
  baseInflation: '0',
  communityTax: ON_CHAIN_COMMUNITY_TAX.toString(),
  bondedTokens: '0',
  blocksPerYear: '0',
  currentBlockTime: ON_CHAIN_BLOCK_TIME,
  currentBlocksPerYear: ON_CHAIN_BLOCKS_PER_YEAR,
  actualBlockTime: 0,
  actualBlocksPerYear: 0,
  pool: {} as Pool,
  mintParams: {} as MintModuleParams,
  distributionParams: {} as DistributionModuleParams
})

export const useSharedParamStore = defineStore('sharedParam', {
  state: (): ParamStoreState => initialStateFactory(),
  getters: {
    apr: (state) => {
      const secondsInAYear = new BigNumberInBase(365 * 24 * 60 * 60)
      const blockPerYear = new BigNumberInBase(state.currentBlocksPerYear)
      const blockTime = secondsInAYear.div(blockPerYear)
      const annualProvisionRatio = blockTime.div(state.currentBlockTime)

      const apr = new BigNumberInBase(state.currentBlocksPerYear)
        .dividedBy(state.blocksPerYear)
        .times(state.baseInflation)
        .times(state.injSupply)
        .times(new BigNumberInBase(1).minus(state.communityTax))
        .div(state.bondedTokens)
        .times(annualProvisionRatio)

      return apr.isNaN() ? new BigNumberInBase(0) : apr
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

      try {
        const { inflation } = await mintApi.fetchInflation()

        paramsStore.$patch({
          baseInflation: inflation || ON_CHAIN_INFLATION.toString()
        })
      } catch (e) {
        paramsStore.$patch({
          baseInflation: ON_CHAIN_INFLATION.toString()
        })
      }
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
          currentBlockTime: ON_CHAIN_BLOCK_TIME,
          currentBlocksPerYear: ON_CHAIN_BLOCKS_PER_YEAR,
          actualBlockTime: data.chain.params.actual_block_time,
          actualBlocksPerYear: data.chain.params.actual_blocks_per_year
        })
      } catch (error: any) {
        // silently throw
        paramStore.$patch({
          currentBlockTime: ON_CHAIN_BLOCK_TIME,
          currentBlocksPerYear: ON_CHAIN_BLOCKS_PER_YEAR,
          actualBlockTime: ON_CHAIN_BLOCK_TIME,
          actualBlocksPerYear: ON_CHAIN_BLOCKS_PER_YEAR
        })
      }
    }
  }
})