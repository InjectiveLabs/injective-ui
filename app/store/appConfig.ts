import { defineStore } from 'pinia'
import { bffApi } from '../service/bff'
import { NETWORK } from '../utils/constant'
import { getBffProduct } from '../utils/helper'
import {
  PersistentTtlCache,
  createPersistentCacheKey
} from '../providers/persistentTtlCache'
import type { BffAppConfig } from '../types'

export type AppConfigStoreState = {
  appConfig?: BffAppConfig
  viewedAnnouncementIds: string[]
}

const APP_CONFIG_CACHE_TTL_MS = 30 * 1000
const appConfigCache = new PersistentTtlCache({
  version: 1,
  dbName: 'injective-ui-app-config',
  storeName: 'responses'
})

export const useSharedAppConfigStore = defineStore('sharedAppConfig', {
  state: (): AppConfigStoreState => ({
    appConfig: undefined,
    viewedAnnouncementIds: []
  }),

  actions: {
    async fetchAppConfig() {
      const app = getBffProduct()

      this.appConfig = await appConfigCache.cached({
        ttlMs: APP_CONFIG_CACHE_TTL_MS,
        allowStaleOnError: true,
        shouldCacheValue: (appConfig) => !!appConfig,
        key: createPersistentCacheKey('app-config', { app, network: NETWORK }),
        request: async () => {
          const { data } = await bffApi.api.v1.app_config.get({
            params: { query: { app, network: NETWORK } }
          })

          return data?.data
        }
      })
    },

    async updateViewedAnnouncementIds(announcementIds: string[]) {
      this.$patch({
        viewedAnnouncementIds: [
          ...announcementIds,
          ...this.viewedAnnouncementIds
        ]
      })
    }
  }
})
