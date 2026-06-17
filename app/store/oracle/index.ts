import { defineStore } from 'pinia'
import { SharedStreamKey } from '../../streams/types'
import { DEFAULT_RETRY_CONFIG } from '../../streams/config'
import { ENDPOINTS, IS_MAINNET } from '../../utils/constant'
import {
  CHAIN_LINK_USDC_SYMBOL,
  ORACLE_USD_PRICE_TOKENS,
  ORACLE_TYPE_CHAINLINK_DATASTREAMS
} from '../../data/oracle'
import type { OraclePriceMap } from '../../types/oracle'

type SharedOracleStoreState = {
  oraclePriceMap: OraclePriceMap
}

type StreamManagerLike = {
  stop: () => void
  start: () => void
}

const initialStateFactory = (): SharedOracleStoreState => ({
  oraclePriceMap: {
    [CHAIN_LINK_USDC_SYMBOL]: '1'
  }
})

let streamId = 0
let manager: undefined | StreamManagerLike

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
      streamId += 1
      manager?.stop()
      manager = undefined
    },

    async streamOraclePrices(
      { symbols }: { symbols: string[] } = {
        symbols: Object.values(ORACLE_USD_PRICE_TOKENS)
      }
    ) {
      const oracleStore = useSharedOracleStore()
      const localStreamId = streamId + 1

      streamId = localStreamId
      manager?.stop()
      manager = undefined

      const { StreamManagerV2, IndexerGrpcOracleStreamV2 } = await import(
        '@injectivelabs/sdk-ts/client/indexer'
      )

      if (localStreamId !== streamId) {
        return
      }

      const oracleStreamV2 = new IndexerGrpcOracleStreamV2(
        IS_MAINNET
          ? 'https://tc-derivatives.grpc-web.mainnet.asia.injective.network/'
          : ENDPOINTS.indexer
      )

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
      localManager.start()
    }
  }
})
