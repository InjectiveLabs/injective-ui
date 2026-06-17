import vite from './nuxt-config/vite'
import { createResolver } from '@nuxt/kit'
import { defineNuxtConfig } from 'nuxt/config'

const isProduction = process.env.NODE_ENV === 'production'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  vite,
  devtools: { enabled: true },

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

  ui: {
    experimental: {
      componentDetection: true
    }
  },

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
    resolve('./modules/preload-optimization')
  ]
})
