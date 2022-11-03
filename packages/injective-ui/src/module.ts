import { fileURLToPath } from 'node:url'
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'base-components',
    configKey: 'baseComponents'
  },
  hooks: {
    'components:dirs'(dirs) {
      dirs.push({
        path: fileURLToPath(new URL('./../components', import.meta.url)),
        prefix: 'base'
      })
    }
  }
})
