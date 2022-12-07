import { fileURLToPath } from 'node:url'
import { defineNuxtModule } from '@nuxt/kit'

export * from './../lib/types'

export default defineNuxtModule({
  meta: {
    name: 'base-components',
    configKey: 'baseComponents'
  },
  setup(_, nuxt) {
    nuxt.options.css.unshift('@injectivelabs/ui-shared/lib/tailwind.css')
  },
  hooks: {
    'components:dirs'(dirs) {
      dirs.push({
        path: fileURLToPath(new URL('./../lib/components', import.meta.url)),
        prefix: 'base'
      })
    },

    'imports:dirs'(dirs) {
      dirs.push(fileURLToPath(new URL('./../lib/composables', import.meta.url)))
    }
  }
})
