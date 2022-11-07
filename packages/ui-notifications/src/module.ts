import { fileURLToPath } from 'node:url'
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: '@injectivelabs/ui-notifications',
    configKey: 'notifications'
  },
  hooks: {
    'components:dirs'(dirs) {
      dirs.push({
        path: fileURLToPath(new URL('./../lib/components', import.meta.url))
      })
    },

    'imports:dirs'(dirs) {
      dirs.push(fileURLToPath(new URL('./../lib/composables', import.meta.url)))
    }
  }
})
