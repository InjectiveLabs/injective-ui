import {
  DerivativeMarket,
  AllChronosDerivativeMarketSummary,
  PerpetualMarket,
  ExpiryFuturesMarket
} from '@injectivelabs/sdk-ts'
import { BaseCacheApi } from './base'
import {
  indexerDerivativesApi,
  indexerRestDerivativeChronosApi
} from '@/Service'

export class DerivativeCacheApi extends BaseCacheApi {
  async fetchMarkets(props?: { marketStatus?: string }) {
    try {
      const response = await this.client.get<DerivativeMarket[]>(
        '/derivatives/markets',
        { params: { marketStatus: props?.marketStatus } }
      )

      return response.data
    } catch (e) {
      const markets = (await indexerDerivativesApi.fetchMarkets()) as Array<
        PerpetualMarket | ExpiryFuturesMarket
      >

      return markets
    }
  }

  async fetchMarketsSummary() {
    try {
      const response = await this.client.get<
        AllChronosDerivativeMarketSummary[]
      >('/derivatives/summary')

      return response.data
    } catch (e) {
      const response =
        await indexerRestDerivativeChronosApi.fetchMarketsSummary()

      return response
    }
  }
}
