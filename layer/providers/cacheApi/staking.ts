import { Pagination, Validator } from '@injectivelabs/sdk-ts'
import { BaseCacheApi } from './base'
import { stakingApi } from '@/Service'

export class StakingCacheApi extends BaseCacheApi {
  async fetchValidators(_params?: any) {
    try {
      const response = await this.client.get<{
        validators: Validator[]
        pagination: Pagination
      }>('/validators')

      return response.data
    } catch (e) {
      const { validators, pagination } = await stakingApi.fetchValidators({
        limit: 200
      })

      return { validators, pagination }
    }
  }
}
