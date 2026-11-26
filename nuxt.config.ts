import vite from './nuxt-config/vite'
import { createResolver } from '@nuxt/kit'
import { createRequire } from 'node:module'
import bugsnag from './nuxt-config/bugsnag'
import { defineNuxtConfig } from 'nuxt/config'

const isProduction = process.env.NODE_ENV === 'production'

const { resolve } = createResolver(import.meta.url)

// Apps that don't install the Privy SDK build with the stub in app/wallet/privy-stub.ts
const hasPrivySdk = (() => {
  try {
    createRequire(`${process.cwd()}/`).resolve('@privy-io/js-sdk-core')

    return true
  } catch {
    return false
  }
})()

const privyFiles = [
  'app/store/wallet/privy.ts',
  'app/wallet/privy/**',
  'app/wallet/privy-migration/**'
]

export default defineNuxtConfig({
  vite,
  bugsnag,
  devtools: { enabled: true },

  alias: {
    '@shared': resolve('./app'),
    '#shared-privy': resolve(
      hasPrivySdk ? './app/store/wallet/privy' : './app/wallet/privy-stub'
    )
  },

  css: [resolve('./app/assets/tailwind.css')],

  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: {
          '@': ['.'],
          '@/*': ['./*']
        }
      },
      exclude: hasPrivySdk ? [] : privyFiles.map((file) => resolve(file))
    }
  },

  ignore: [
    ...(isProduction ? ['pages/sandbox.vue'] : []),
    ...(hasPrivySdk ? [] : privyFiles)
  ],

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
    ['@injectivelabs/nuxt-bugsnag', bugsnag],
    resolve('./modules/preload-optimization')
  ]
})
