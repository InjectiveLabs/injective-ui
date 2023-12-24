import { SpotMarket, AllChronosSpotMarketSummary } from '@injectivelabs/sdk-ts'
import { BaseCacheApi } from './base'

export class SpotCacheApi extends BaseCacheApi {
  async fetchMarkets() {
    const response = await this.client.get<SpotMarket[]>('/spot/markets')

    return response.data
  }

  async fetchMarketsSummary() {
    const response = await this.client.get<AllChronosSpotMarketSummary[]>(
      '/spot/summary'
    )

    return response.data
  }
}
