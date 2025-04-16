import { BaseCacheApi } from './base'
import { IS_MAINNET } from './../../utils/constant'
import { indexerSpotApi, indexerRestSpotChronosApi } from '../../Service'
import type { SpotMarket, AllChronosSpotMarketSummary } from '@injectivelabs/sdk-ts'

export class SpotCacheApi extends BaseCacheApi {
  async fetchMarketsSummary() {
    const fetchFromExchange = async () => {
      const response = await indexerRestSpotChronosApi.fetchMarketsSummary()

      return response
    }

    if (!IS_MAINNET) {
      return fetchFromExchange()
    }

    try {
      const response = await this.client.get<AllChronosSpotMarketSummary[]>(
        '/v1/cache/spot/summary'
      )

      return response.data
    } catch {
      return fetchFromExchange()
    }
  }

  async fetchMarkets() {
    const fetchFromExchange = async () => {
      const response = await indexerSpotApi.fetchMarkets()

      return response
    }

    if (!IS_MAINNET) {
      return fetchFromExchange()
    }

    try {
      const response = await this.client.get<SpotMarket[]>('/v1/cache/spot/markets')

      return response.data
    } catch {
      return fetchFromExchange()
    }
  }
}
