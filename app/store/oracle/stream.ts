import { ENDPOINTS } from '../../utils/constant'
import { DEFAULT_RETRY_CONFIG } from '../../streams/config'
import {
  ORACLE_USD_PRICE_TOKENS,
  ORACLE_TYPE_CHAINLINK_DATASTREAMS
} from '../../data/oracle'
import {
  StreamManagerV2,
  IndexerGrpcOracleStreamV2
} from '@injectivelabs/sdk-ts/client/indexer'

let manager: undefined | StreamManagerV2<any>

const oracleStreamV2 = new IndexerGrpcOracleStreamV2(ENDPOINTS.indexer)

export const cancelOraclePrices = () => {
  manager?.stop()
  manager = undefined
}

export const streamOraclePrices = (
  { symbols }: { symbols: string[] } = {
    symbols: Object.values(ORACLE_USD_PRICE_TOKENS)
  }
) => {
  const oracleStore = useSharedOracleStore()

  cancelOraclePrices()

  const localManager = new StreamManagerV2({
    id: 'shared-oracle-prices',
    streamFactory: () =>
      oracleStreamV2.streamOracleList({
        symbols,
        oracleType: ORACLE_TYPE_CHAINLINK_DATASTREAMS,
        callback: (response) => localManager.emit('data', response)
      }),
    onData: (oraclePrice: {
      price?: string
      symbol?: string
      oracleType?: string
      timestamp?: string | number
    }) => {
      if (!oraclePrice.price || !oraclePrice.symbol) {
        return
      }

      oracleStore.oraclePriceMap = {
        ...oracleStore.oraclePriceMap,
        [oraclePrice.symbol]: {
          price: oraclePrice.price,
          symbol: oraclePrice.symbol,
          timestamp: Number(oraclePrice.timestamp ?? 0),
          oracleType:
            oraclePrice.oracleType ?? ORACLE_TYPE_CHAINLINK_DATASTREAMS
        }
      }
    },
    retryConfig: DEFAULT_RETRY_CONFIG
  })

  manager = localManager
  manager.start()
}
