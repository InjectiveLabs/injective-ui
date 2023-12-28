import { SpotMarket, AllChronosSpotMarketSummary } from '@injectivelabs/sdk-ts'
import { BaseCacheApi } from './base'
import { indexerRestSpotChronosApi, indexerSpotApi } from '@/Service'

export class SpotCacheApi extends BaseCacheApi {
  async fetchMarkets() {
    try {
      const response = await this.client.get<SpotMarket[]>('/spot/markets')

      return response.data
    } catch (e) {
      const response = await indexerSpotApi.fetchMarkets()

      return response
    }
  }

  async fetchMarketsSummary() {
    try {
      const response = await this.client.get<AllChronosSpotMarketSummary[]>(
        '/spot/summary'
      )

      return response.data
    } catch (e) {
      const response = await indexerRestSpotChronosApi.fetchMarketsSummary()

      return response
    }
  }
}
