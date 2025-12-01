import { BaseCacheApi } from './base'
import type { StrapiApp } from '../../types'

export class StrapiCacheApi extends BaseCacheApi {
  async fetchFeaturedApps() {
    const response = await this.client.get<{
      data: { featured_apps: StrapiApp[] }
    }>('cache/strapi/featured-app-list')

    return response.data
  }

  async fetchApplicationTypeList() {
    const response = await this.client.get<{ data: any[] }>(
      'cache/strapi/application-type-list'
    )

    return response.data
  }
}
