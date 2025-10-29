import { vite } from './nuxt-config'
import { createResolver } from '@nuxt/kit'
import bugsnag from './nuxt-config/bugsnag'
import { defineNuxtConfig } from 'nuxt/config'
import { vitePlugins } from './nuxt-config/vite'

const isProduction = process.env.NODE_ENV === 'production'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  vite,
  plugins: vitePlugins,
  devtools: { enabled: true },

  alias: { '@shared': resolve('./app') },

  css: [resolve('./app/assets/tailwind.css')],

  ignore: isProduction ? ['pages/sandbox.vue'] : [],

  sourcemap: {
    client: true,
    server: false
  },

  components: [{ prefix: 'Shared', path: resolve('./app/components') }],

  imports: {
    dirs: ['app/store/**']
  },

  pinia: {
    storesDirs: ['app/store/**']
  },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/eslint',
    'nuxt-vitalizer',
    '@nuxt/test-utils/module',
    ['@injectivelabs/nuxt-bugsnag', bugsnag]
  ]
})
