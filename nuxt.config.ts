import { createResolver } from '@nuxt/kit'
import { vite, hooks } from './nuxt-config'
import bugsnag from './nuxt-config/bugsnag'
import { defineNuxtConfig } from 'nuxt/config'

const isProduction = process.env.NODE_ENV === 'production'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  vite,
  bugsnag,
  hooks,
  devtools: { enabled: true },

  plugins: [{ ssr: false, src: resolve('./../nuxt-config/polyfill.ts') }],

  alias: { '@shared': resolve('./app') },

  css: [resolve('./app/assets/tailwind.css')],

  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: {
          '@': ['.'],
          '@/*': ['./*']
        }
      }
    }
  },

  ignore: isProduction ? ['pages/sandbox.vue'] : [],

  sourcemap: {
    client: true,
    server: false
  },

  components: [{ prefix: 'Shared', path: resolve('./app/components') }],

  pinia: {
    storesDirs: ['store/**']
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
