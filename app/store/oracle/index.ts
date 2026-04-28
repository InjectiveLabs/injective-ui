import { defineStore } from 'pinia'
import { ENDPOINTS } from '../../utils/constant'
import { SharedStreamKey } from '../../streams/types'
import { DEFAULT_RETRY_CONFIG } from '../../streams/config'
import { ORACLE_USD_PRICE_TOKENS, ORACLE_TYPE_CHAINLINK_DATASTREAMS } from '../../data/oracle'
import {
  StreamManagerV2,
  IndexerGrpcOracleStreamV2
} from '@injectivelabs/sdk-ts/client/indexer'
import type { OraclePriceMap } from '../../types/oracle'

type SharedOracleStoreState = {
  oraclePriceMap: OraclePriceMap
}

const initialStateFactory = (): SharedOracleStoreState => ({
  oraclePriceMap: {}
})

let manager: undefined | StreamManagerV2<any>

const oracleStreamV2 = new IndexerGrpcOracleStreamV2(ENDPOINTS.indexer)

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

        return Number(state.oraclePriceMap[symbol]) || 0
      }
  },
  actions: {
    cancelOraclePrices() {
      manager?.stop()
      manager = undefined
    },

    streamOraclePrices(
      { symbols }: { symbols: string[] } = {
        symbols: Object.values(ORACLE_USD_PRICE_TOKENS)
      }
    ) {
      const oracleStore = useSharedOracleStore()

      oracleStore.cancelOraclePrices()

      const localManager = new StreamManagerV2({
        id: SharedStreamKey.OraclePrices,
        streamFactory: () =>
          oracleStreamV2.streamOracleList({
            symbols,
            oracleType: ORACLE_TYPE_CHAINLINK_DATASTREAMS,
            callback: (response) => localManager.emit('data', response)
          }),
        onData: (oraclePrice: { price?: string; symbol?: string }) => {
          if (!oraclePrice.price || !oraclePrice.symbol) {
            return
          }

          oracleStore.oraclePriceMap = {
            ...oracleStore.oraclePriceMap,
            [oraclePrice.symbol]: oraclePrice.price
          }
        },
        retryConfig: DEFAULT_RETRY_CONFIG
      })

      manager = localManager
      manager.start()
    }
  }
})
