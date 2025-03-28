import { SpotMarket, AllChronosSpotMarketSummary } from '@injectivelabs/sdk-ts'
import { indexerRestSpotChronosApi, indexerSpotApi } from '../../Service'
import { IS_MAINNET } from './../../utils/constant'
import { BaseCacheApi } from './base'

export class SpotCacheApi extends BaseCacheApi {
  async fetchMarkets() {
    const fetchFromExchange = async () => {
      const response = await indexerSpotApi.fetchMarkets()

      return response
    }

    if (!IS_MAINNET) {
      return fetchFromExchange()
    }

    try {
      const response = await this.client.get<SpotMarket[]>('/spot/markets')

      return response.data
    } catch (e) {
      return fetchFromExchange()
    }
  }

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
        '/spot/summary'
      )

      return response.data
    } catch (e) {
      return fetchFromExchange()
    }
  }
}
