import { defineNuxtConfig } from 'nuxt/config'
import { vite } from './nuxt-config'
import { createResolver } from '@nuxt/kit'
import bugsnag from './nuxt-config/bugsnag'
import { vitePlugins } from './nuxt-config/vite'

const isProduction = process.env.NODE_ENV === 'production'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  vite,
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
    'nuxt-vitalizer',
    ...(process.env.VITE_BUGSNAG_KEY ? ['@injectivelabs/nuxt-bugsnag'] : [])
  ],

  typescript: {
    typeCheck: 'build'
  },

  sourcemap: {
    server: false,
    client: true
  },

  //@ts-ignore
  bugsnag
})
