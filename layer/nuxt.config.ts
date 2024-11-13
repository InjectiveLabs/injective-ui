import { createResolver } from '@nuxt/kit'
import { defineNuxtConfig } from 'nuxt/config'
import { vite } from './nuxt-config'
import bugsnag from './nuxt-config/bugsnag'
import { vitePlugins } from './nuxt-config/vite'

const isProduction = process.env.NODE_ENV === 'production'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  vite,
  plugins: vitePlugins,
  devtools: { enabled: true },
  alias: { '@shared': resolve('./') },

  imports: {
    dirs: ['composables/**', 'store/**', 'store/**/index.ts']
  },

  ignore: isProduction ? ['pages/sandbox.vue'] : [],

  components: [{ path: resolve('./components'), prefix: 'Shared' }],

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/devtools',
    'nuxt-vitalizer',
    'nuxt-lcp-speedup',
    ['nuxt-bugsnag', { ...bugsnag }]
  ],

  typescript: {
    typeCheck: 'build'
  },

  sourcemap: {
    server: false,
    client: true
  }
})
