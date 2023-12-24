import { Pagination, TotalSupply } from '@injectivelabs/sdk-ts'
import { BaseCacheApi } from './base'

export class TokenCacheApi extends BaseCacheApi {
  async fetchTotalSupply() {
    const response = await this.client.get<{
      supply: TotalSupply
      pagination: Pagination
    }>('/tokens')

    return response.data
  }
}
