import { fileURLToPath } from 'node:url'
import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: '@injectivelabs/notifications',
    configKey: 'notifications'
  },
  hooks: {
    'components:dirs'(dirs) {
      console.log(import.meta.url)
      dirs.push({
        path: fileURLToPath(new URL('./../lib/components', import.meta.url)),
        prefix: 'base'
      })
    }
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    addPlugin({ src: resolve('./plugin.ts') })
  }
})
