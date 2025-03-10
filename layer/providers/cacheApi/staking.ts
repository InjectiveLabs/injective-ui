import { Pagination, Validator, ExplorerValidator } from '@injectivelabs/sdk-ts'
import { BaseCacheApi } from './base'
import { IS_MAINNET } from './../../utils/constant'
import { stakingApi, indexerRestExplorerApi } from '../../Service'

export class StakingCacheApi extends BaseCacheApi {
  async fetchValidators(_params?: any) {
    const fetchFromSource = async () => {
      const { validators, pagination } = await stakingApi.fetchValidators({
        limit: 500
      })

      return { validators, pagination }
    }

    if (!IS_MAINNET) {
      return fetchFromSource()
    }

    try {
      const response = await this.client.get<{
        validators: Validator[]
        pagination: Pagination
      }>('/validators')

      return response.data
    } catch (e) {
      return fetchFromSource()
    }
  }

  async fetchExplorerValidators(_params?: any) {
    const fetchFromSource = async () => {
      const explorerValidators = await indexerRestExplorerApi.fetchValidators()

      return explorerValidators
    }

    if (!IS_MAINNET) {
      return fetchFromSource()
    }

    try {
      const response = await this.client.get<{
        validators: ExplorerValidator[]
      }>('/explorer-validators')

      return response.data.validators
    } catch (e) {
      return fetchFromSource()
    }
  }
}
