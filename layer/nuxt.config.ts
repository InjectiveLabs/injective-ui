import { defineNuxtConfig } from 'nuxt/config'
import { vite, hooks } from './nuxt-config'
import { createResolver } from '@nuxt/kit'
import { vitePlugins } from './nuxt-config/vite'

const isProduction = process.env.NODE_ENV === 'production'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  vite,
  hooks,
  plugins: vitePlugins,
  devtools: { enabled: true },
  alias: { '@shared': resolve('./') },

  build: {
    transpile: ['@nuxtjs/i18n']
  },

  imports: {
    dirs: ['composables/**', 'store/**', 'store/**/index.ts']
  },

  ignore: isProduction ? ['pages/sandbox.vue'] : [],

  components: [{ path: resolve('./components'), prefix: 'Shared' }],

  modules: [
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/devtools',
    '@nuxtjs/tailwindcss',
    'nuxt-lcp-speedup',
    ...(process.env.VITE_BUGSNAG_KEY ? ['@injectivelabs/nuxt-bugsnag'] : [])
  ],

  typescript: {
    typeCheck: 'build'
  },

  // @ts-ignore
  bugsnag: process.env.VITE_BUGSNAG_KEY
    ? {
        disabled: false,
        publishRelease: true,
        baseUrl: process.env.VITE_BASE_URL,
        config: {
          releaseStage: process.env.VITE_ENV,
          notifyReleaseStages: ['staging', 'mainnet'],
          appVersion: process.env.npm_package_version,
          apiKey: process.env.VITE_BUGSNAG_KEY
        }
      }
    : undefined,

  sourcemap: {
    server: false,
    client: true
  }
})
