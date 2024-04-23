import {
  PerpetualMarket,
  DerivativeMarket,
  ExpiryFuturesMarket,
  AllChronosDerivativeMarketSummary
} from '@injectivelabs/sdk-ts'
import { BaseCacheApi } from './base'
import {
  indexerDerivativesApi,
  indexerRestDerivativeChronosApi
} from '../../Service'
import { IS_MAINNET } from './../../utils/constant'

export class DerivativeCacheApi extends BaseCacheApi {
  async fetchMarkets(props?: { marketStatus?: string }) {
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
        '/derivatives/markets',
        { params: { marketStatus: props?.marketStatus } }
      )

      return response.data
    } catch (e) {
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
      >('/derivatives/summary')

      return response.data
    } catch (e) {
      return fetchFromExchange()
    }
  }
}
