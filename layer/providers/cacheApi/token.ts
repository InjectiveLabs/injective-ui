import { BaseCacheApi } from './base'
import { IS_MAINNET } from './../../utils/constant'
import { bankApi } from '../../Service'
import type { Pagination, TotalSupply } from '@injectivelabs/sdk-ts'

export class TokenCacheApi extends BaseCacheApi {
  async fetchTotalSupply() {
    const fetchFromBank = async (
      accumulatedSupply: any[] = [],
      nextPageToken?: string
    ): Promise<{ supply: any[]; pagination: any }> => {
      const { supply, pagination } = await bankApi.fetchTotalSupply({
        limit: 10000,
        key: nextPageToken
      })

      const newSupply = [...accumulatedSupply, ...supply]

      if (pagination.next) {
        return fetchFromBank(newSupply, pagination.next)
      }

      return {
        pagination,
        supply: newSupply
      }
    }

    if (!IS_MAINNET) {
      return fetchFromBank()
    }

    try {
      const response = await this.client.get<{
        supply: TotalSupply
        pagination: Pagination
      }>('cache/tokens')

      return response.data
    } catch {
      return fetchFromBank()
    }
  }
}
