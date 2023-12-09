import { defineNuxtConfig } from 'nuxt/config'
import { vite, hooks } from './nuxt-config'
import { createResolver } from '@nuxt/kit'
import { vitePlugins } from './nuxt-config/vite'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  devtools: { enabled: true },
  vite,
  hooks,
  alias: { '@shared': resolve('./') },
  components: [{ path: resolve('./components'), prefix: 'Shared' }],
  imports: {
    dirs: ['composables/**', 'store/**']
  },
  typescript: {
    includeWorkspace: true
  },
  build: {
    transpile: ['@nuxtjs/i18n']
  },
  modules: [
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/devtools',
    '@nuxtjs/tailwindcss'
  ],
  plugins: vitePlugins
})
