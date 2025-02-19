/* eslint-disable camelcase, no-console */
import { HttpRestClient } from '@injectivelabs/utils'

// const PYTH_SERVICE_URL = 'https://benchmarks.pyth.network/v1/'

const NUXT_CACHE_PYTH_SERVICE_URL =
  'https://injective-nuxt-api-staging.vercel.app/api/v1/'

export class PythService {
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
