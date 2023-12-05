import { defineStore } from 'pinia'

type TestStoreState = {
  devMode: boolean
}

const initialStateFactory = (): TestStoreState => ({
  devMode: false
})

export const useTestStore = defineStore('test', {
  state: (): TestStoreState => initialStateFactory(),
  actions: {
    async setDevMode() {
      const route = useRoute()
      const testStore = useTestStore()

      testStore.$patch({
        devMode: !!(route.query.devMode && route.query.devMode === 'true')
      })
    }
  }
})
