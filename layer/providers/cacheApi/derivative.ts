import { BaseCacheApi } from './base'
import { IS_MAINNET } from './../../utils/constant'
import {
  indexerDerivativesApi,
  indexerRestDerivativeChronosApi
} from '../../Service'
import type {
  PerpetualMarket,
  DerivativeMarket,
  ExpiryFuturesMarket,
  AllChronosDerivativeMarketSummary
} from '@injectivelabs/sdk-ts'

export class DerivativeCacheApi extends BaseCacheApi {
  async fetchMarkets() {
    const fetchFromExchange = async () => {
      const markets = (await indexerDerivativesApi.fetchMarkets()) as Array<
        PerpetualMarket | ExpiryFuturesMarket
      >

      return markets
    }

    if (!IS_MAINNET) {
      return fetchFromExchange()
    }

    try {
      const response = await this.client.get<DerivativeMarket[]>(
        '/v1/cache/derivatives/markets'        
      )

      return response.data
    } catch{
      return fetchFromExchange()
    }
  }

  async fetchMarketsSummary() {
    const fetchFromExchange = async () => {
      const response =
        await indexerRestDerivativeChronosApi.fetchMarketsSummary()

      return response
    }

    if (!IS_MAINNET) {
      return fetchFromExchange()
    }

    try {
      const response = await this.client.get<
        AllChronosDerivativeMarketSummary[]
      >('/v1/cache/derivatives/summary')

      return response.data
    } catch{
      return fetchFromExchange()
    }
  }
}
