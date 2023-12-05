import { vite, hooks } from './nuxt-config'
import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  vite,
  hooks,
  alias: { '@layer': resolve('./') },
  imports: {
    dirs: ['composables/**', 'store/**']
  }
})
