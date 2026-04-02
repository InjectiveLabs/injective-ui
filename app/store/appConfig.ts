import { defineStore } from 'pinia'
import { NETWORK } from '../utils/constant'
import { getBffProduct } from '../utils/helper'
import { bffApi } from '../service'
import type { BffAppConfig } from '../types'

export type AppConfigStoreState = {
  appConfig?: BffAppConfig
  viewedAnnouncementIds: string[]
}

export const useSharedAppConfigStore = defineStore('sharedAppConfig', {
  state: (): AppConfigStoreState => ({
    appConfig: undefined,
    viewedAnnouncementIds: []
  }),

  actions: {
    async fetchAppConfig() {
      const { data } = await bffApi.api.v1.app_config.get({
        params: { query: { network: NETWORK, app: getBffProduct() } }
      })

      this.appConfig = data?.data
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
