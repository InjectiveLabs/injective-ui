import { defineStore } from 'pinia'
import { HttpClient } from '@injectivelabs/utils'
import { IS_MAINNET } from '../utils/constant'

const CLOUD_FRONT_URL = 'https://d36789lqgasyke.cloudfront.net'

const client = new HttpClient(CLOUD_FRONT_URL, {
  headers: {}
})

export type JsonStoreState = { tokens: any[] }

export const useSharedJsonStore = defineStore('sharedJson', {
  state: (): JsonStoreState => ({
    tokens: []
  }),

  actions: {
    async fetchTokenJson() {
      const sharedJsonStore = useSharedJsonStore()

      if (!IS_MAINNET) {
        return
      }

      const data = await client.get('json/tokens/mainnet.json')
      // eslint-disable-next-line no-console
      console.log({ data })

      sharedJsonStore.$patch({
        tokens: await client.get('json/tokens/mainnet.json')
      })
    }
  }
})
