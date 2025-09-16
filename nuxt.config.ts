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

  // typescript: {
  //   typeCheck: 'build'
  // },

  ignore: isProduction ? ['pages/sandbox.vue'] : [],

  sourcemap: {
    client: true,
    server: false
  },

  components: [{ prefix: 'Shared', path: resolve('./app/components') }],

  // todo: decide the solution & remove non-needed ones
  imports: {
    dirs: [
      'app/store/**',
      'app/composables/**',
    ]
  },

  modules: [
    ['@pinia/nuxt', { storesDirs: ['./app/store'] }],
    // ['@pinia/nuxt', { storesDirs: ['./app/store/*.ts', './app/store/*/index.ts'] }],
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/eslint',
    'nuxt-vitalizer',
    '@nuxt/test-utils/module',
    ['@injectivelabs/nuxt-bugsnag', bugsnag],
  ]
})
