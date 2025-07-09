import { BaseCacheApi } from './base'
import { IS_MAINNET } from './../../utils/constant'
import { indexerSpotApi, indexerRestSpotChronosApi } from '../../Service'
import type {
  SpotMarket,
  AllChronosSpotMarketSummary
} from '@injectivelabs/sdk-ts'
import type { SharedMarketStatus } from '../../types'

export class SpotCacheApi extends BaseCacheApi {
  async fetchMarkets(marketStatuses?: SharedMarketStatus[]) {
    const fetchFromExchange = async () => {
      const response = await indexerSpotApi.fetchMarkets(
        marketStatuses ? { marketStatuses } : undefined
      )

      return response
    }

    if (!IS_MAINNET) {
      return fetchFromExchange()
    }

    try {
      const response = await this.client.get<SpotMarket[]>(
        'cache/spot/markets',
        marketStatuses ? { params: { marketStatuses } } : undefined
      )

      return response.data
    } catch {
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
      const response =
        await this.client.get<AllChronosSpotMarketSummary[]>(
          'cache/spot/summary'
        )

      return response.data
    } catch {
      return fetchFromExchange()
    }
  }
}
