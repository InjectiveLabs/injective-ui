import { ENDPOINTS } from '../utils/constant'
import { UiApiService } from '../providers/uiApi'
import { SpotCacheApi } from '../providers/cacheApi/spot'
import { TokenCacheApi } from '../providers/cacheApi/token'
import { StrapiCacheApi } from '../providers/cacheApi/strapi'
import { StakingCacheApi } from '../providers/cacheApi/staking'
import { DerivativeCacheApi } from '../providers/cacheApi/derivative'

export const uiApi = new UiApiService(ENDPOINTS.uiApi)
export const spotCacheApi = new SpotCacheApi(ENDPOINTS.uiApi)
export const tokenCacheApi = new TokenCacheApi(ENDPOINTS.uiApi)
export const strapiCacheApi = new StrapiCacheApi(ENDPOINTS.uiApi)
export const stakingCacheApi = new StakingCacheApi(ENDPOINTS.uiApi)
export const derivativeCacheApi = new DerivativeCacheApi(ENDPOINTS.uiApi)
