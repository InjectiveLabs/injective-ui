import { Pagination, TotalSupply } from '@injectivelabs/sdk-ts'
import { BaseCacheApi } from './base'
import { bankApi } from '../../Service'
import { IS_MAINNET } from './../../utils/constant'

export class TokenCacheApi extends BaseCacheApi {
  async fetchTotalSupply() {
    const fetchFromBank = async () => {
      const { supply, pagination } = await bankApi.fetchTotalSupply({
        limit: 5000
      })

      return { supply, pagination }
    }

    if (!IS_MAINNET) {
      return fetchFromBank()
    }

    try {
      const response = await this.client.get<{
        supply: TotalSupply
        pagination: Pagination
      }>('/tokens')

      return response.data
    } catch (e) {
      return fetchFromBank()
    }
  }
}
