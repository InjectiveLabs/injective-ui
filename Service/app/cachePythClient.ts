import { HttpRestClient } from '@injectivelabs/utils'
import { ENDPOINTS } from '../../utils/constant/setup'

const NUXT_CACHE_PYTH_SERVICE_URL = ENDPOINTS.uiApi

export class CachePythService {
  private restClient: HttpRestClient

  constructor() {
    this.restClient = new HttpRestClient(NUXT_CACHE_PYTH_SERVICE_URL)
  }

  public fetchRwaMarketOpenNoThrow = async (pythId: string) => {
    try {
      const {
        data: {
          market_hours: { is_open }
        }
      } = (await this.restClient.get(`price_feeds/${pythId}`)) as {
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
}
