import VueGtag from 'vue-gtag'
import hotjar from 'vue-hotjar'
import { defineNuxtPlugin } from 'nuxt/app'
import { HOTJAR_KEY, GOOGLE_ANALYTICS_KEY } from '../utils/constant'

export default defineNuxtPlugin((nuxtApp) => {
  if (GOOGLE_ANALYTICS_KEY) {
    nuxtApp.vueApp.use(VueGtag as any, {
      config: {
        id: GOOGLE_ANALYTICS_KEY
      }
    })
  }

  if (HOTJAR_KEY) {
    nuxtApp.vueApp.use(hotjar as any, {
      id: HOTJAR_KEY
    })
  }
})
