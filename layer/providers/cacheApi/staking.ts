import { Pagination, Validator } from '@injectivelabs/sdk-ts'
import { BaseCacheApi } from './base'
import { stakingApi } from '../../Service'
import { IS_MAINNET } from '~/utils/constant'

export class StakingCacheApi extends BaseCacheApi {
  async fetchValidators(_params?: any) {
    const fetchFromStaking = async () => {
      const { validators, pagination } = await stakingApi.fetchValidators({
        limit: 200
      })

      return { validators, pagination }
    }

    if (!IS_MAINNET) {
      return fetchFromStaking()
    }

    try {
      const response = await this.client.get<{
        validators: Validator[]
        pagination: Pagination
      }>('/validators')

      return response.data
    } catch (e) {
      return fetchFromStaking()
    }
  }
}
