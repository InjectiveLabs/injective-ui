import { HttpRestClient } from '@injectivelabs/utils'
import { ENDPOINTS } from '../../utils/constant/setup'

const NUXT_CACHE_PYTH_SERVICE_URL = ENDPOINTS.uiApi

export class CacheRwaPriceFeedService {
  private restClient: HttpRestClient

  constructor() {
    this.restClient = new HttpRestClient(NUXT_CACHE_PYTH_SERVICE_URL)
  }

  public fetchPythRwaMarketOpenNoThrow = async (oracle: string) => {
    try {
      const {
        data: {
          market_hours: { is_open }
        }
      } = (await this.restClient.get(`price_feeds/${oracle}`)) as {
        data: {
          market_hours: {
            is_open: boolean
          }
        }
      }

      return is_open
    } catch (e: unknown) {
      console.log(e)

      return false
    }
  }

  public fetchSedaRwaMarketOpenNoThrow = async (oracle: string) => {
    try {
      const {
        data: { was_stale }
      } = (await this.restClient.get(`/price_feeds/seda/${oracle}`)) as {
        data: {
          was_stale: boolean
        }
      }

      const is_open = !was_stale

      return is_open
    } catch (e: unknown) {
      console.log(e)

      return false
    }
  }
}
