import { Pagination, TotalSupply } from '@injectivelabs/sdk-ts'
import { BaseCacheApi } from './base'
import { bankApi } from '../../Service'

export class TokenCacheApi extends BaseCacheApi {
  async fetchTotalSupply() {
    try {
      const response = await this.client.get<{
        supply: TotalSupply
        pagination: Pagination
      }>('/tokens')

      return response.data
    } catch (e) {
      const { supply, pagination } = await bankApi.fetchTotalSupply({
        limit: 2000
      })

      return { supply, pagination }
    }
  }
}
