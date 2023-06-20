import { fileURLToPath } from 'node:url'
import { addImports, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'base-components',
    configKey: 'baseComponents'
  },
  setup(_, nuxt) {
    nuxt.options.css.unshift('@injectivelabs/ui-shared/lib/tailwind.css')

    addImports({
      from: fileURLToPath(new URL('./../lib/utils', import.meta.url)),
      name: 'commonUtils'
    })
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
