import VueGtag from 'vue-gtag'
import { defineNuxtPlugin } from '#imports'
import { GOOGLE_ANALYTICS_KEY } from './../utils/constant'

export default defineNuxtPlugin((nuxtApp) => {
  if (GOOGLE_ANALYTICS_KEY) {
    nuxtApp.vueApp.use(VueGtag as any, {
      config: {
        id: GOOGLE_ANALYTICS_KEY
      }
    })
  }
})
