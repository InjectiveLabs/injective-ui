import { defineNuxtPlugin } from '#imports'
import { GOOGLE_ANALYTICS_KEY } from './../utils/constant'

const GTAG_BOOT_DELAY_MS = 8000
const GTAG_IDLE_TIMEOUT_MS = 3000

type WindowWithIdleCallback = {
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions
  ) => number
} & typeof globalThis &
  Window

function scheduleGtagInstall(callback: () => void) {
  globalThis.setTimeout(() => {
    const windowWithIdleCallback = window as WindowWithIdleCallback

    if (windowWithIdleCallback.requestIdleCallback) {
      windowWithIdleCallback.requestIdleCallback(callback, {
        timeout: GTAG_IDLE_TIMEOUT_MS
      })

      return
    }

    globalThis.setTimeout(callback, 0)
  }, GTAG_BOOT_DELAY_MS)
}

export default defineNuxtPlugin((nuxtApp) => {
  if (!GOOGLE_ANALYTICS_KEY) {
    return
  }

  scheduleGtagInstall(async () => {
    const { default: VueGtag } = await import('vue-gtag')

    nuxtApp.vueApp.use(VueGtag as any, {
      config: {
        id: GOOGLE_ANALYTICS_KEY
      }
    })
  })
})
