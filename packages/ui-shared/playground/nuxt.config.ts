import { defineNuxtConfig } from 'nuxt/config'
import { Network } from '@injectivelabs/networks'
import AppComponents from '..'

export default defineNuxtConfig({
  modules: [AppComponents, '@vueuse/nuxt', '@nuxtjs/tailwindcss'],
  tailwindcss: {
    cssPath: './../lib/css/tailwind.css'
  },
  base: {
    network: Network.Devnet
  }
})
