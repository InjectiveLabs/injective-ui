import { defineStore } from 'pinia'
import { lazyPiniaAction } from '../../utils/pinia'
import { ORACLE_USD_PRICE_TOKENS } from '../../data/oracle'
import type { OraclePriceMap } from '../../types/oracle'

type SharedOracleStoreState = {
  oraclePriceMap: OraclePriceMap
}

const initialStateFactory = (): SharedOracleStoreState => ({
  oraclePriceMap: {}
})

export const useSharedOracleStore = defineStore('sharedOracle', {
  state: (): SharedOracleStoreState => initialStateFactory(),
  getters: {
    tokenUsdPrice:
      (state) =>
      (denom?: string): number => {
        if (!denom) {
          return 0
        }

        const symbol = ORACLE_USD_PRICE_TOKENS[denom]

        if (!symbol) {
          return 0
        }

        return Number(state.oraclePriceMap[symbol]?.price) || 0
      }
  },
  actions: {
    streamOraclePrices: lazyPiniaAction(
      () => import('./stream'),
      'streamOraclePrices'
    ),
    cancelOraclePrices: lazyPiniaAction(
      () => import('./stream'),
      'cancelOraclePrices'
    )
  }
})
