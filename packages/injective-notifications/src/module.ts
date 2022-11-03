import { fileURLToPath } from 'node:url'
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: '@injectivelabs/notifications',
    configKey: 'notifications'
  },
  hooks: {
    'components:dirs'(dirs) {
      dirs.push({
        path: fileURLToPath(new URL('./../lib/components', import.meta.url))
      })
    }

    // 'imports:dirs'(dirs) {
    //   dirs.push(fileURLToPath(new URL('./../lib/composables', import.meta.url)))
    // }

    // 'imports:sources'(sources) {
    //   sources.push({
    //     imports: {
    //       from: `@injectivelabs/notifications`,
    //       name:
    //     }
    //   })
    // }
  }
})
