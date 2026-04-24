import { BaseStreamRegistry } from './base'
import { DEFAULT_RETRY_CONFIG } from '../config'
import { ENDPOINTS } from '../../utils/constant'
import { SharedStreamKey, type StreamHandlers } from '../types'
import { StreamManagerV2, IndexerGrpcOracleStreamV2 } from '@injectivelabs/sdk-ts/client/indexer'
import type { OraclePriceStreamCallbackV2 } from '@injectivelabs/sdk-ts/client/indexer'

const USDC_USD_ORACLE_TYPE = 'chainlinkdatastreams'
const USDC_USD_QUOTE_SYMBOL =
  '0x0003dc85e8b01946bf9dfd8b0db860129181eb6105a8c8981d9f28e00b6f60d9'

let oracleStreamV2: IndexerGrpcOracleStreamV2 | undefined

function getOracleStreamV2(): IndexerGrpcOracleStreamV2 {
  if (!oracleStreamV2) {
    oracleStreamV2 = new IndexerGrpcOracleStreamV2(ENDPOINTS.indexer)
  }

  return oracleStreamV2
}

export class OracleStreamRegistry extends BaseStreamRegistry {
  subscribeUsdcUsdPrice(
    handlers: StreamHandlers<Parameters<OraclePriceStreamCallbackV2>[0]>
  ): void {
    const streamId = SharedStreamKey.UsdcUsdPrice

    const manager = new StreamManagerV2({
      id: streamId,
      streamFactory: () => {
        return getOracleStreamV2().streamOraclePrices({
          oracleType: USDC_USD_ORACLE_TYPE,
          quoteSymbol: USDC_USD_QUOTE_SYMBOL,
          callback: (response) => manager.emit('data', response)
        })
      },
      onData: handlers.onData,
      retryConfig: DEFAULT_RETRY_CONFIG
    })

    this.registerStream(streamId, manager, handlers)
  }

  unsubscribeUsdcUsdPrice(): void {
    this.unsubscribe(SharedStreamKey.UsdcUsdPrice)
  }
}
