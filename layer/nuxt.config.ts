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
    '@nuxtjs/i18n',
    'nuxt-security',
    '@nuxt/devtools',
    'nuxt-vitalizer',
    '@injectivelabs/nuxt-bugsnag'
  ],

  bugsnag,

  // @ts-ignore
  security: {
    nonce: true, // Enables HTML nonce support in SSR mode
    ssg: {
      meta: true, // Enables CSP as a meta tag in SSG mode
      hashScripts: true, // Enables CSP hash support for scripts in SSG mode
      hashStyles: false // Disables CSP hash support for styles in SSG mode (recommended)
    },
    headers: {
      contentSecurityPolicy: {
        'base-uri': ["'none'"],
        'img-src': [
          "'self'",
          'data:',
          'https://blog.helixapp.com/',
          'https://imagedelivery.net'
        ]
      }
    }
  },

  // Refused to set the document's base URI to 'http://localhost:3000/chart/charting_library/' because it violates the following Content Security Policy directive: "base-uri 'none'"

  typescript: {
    typeCheck: 'build'
  },

  sourcemap: {
    server: false,
    client: true
  }
})
