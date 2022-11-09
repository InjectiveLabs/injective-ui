import { fileURLToPath } from 'node:url'
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'base-components',
    configKey: 'baseComponents'
  },
  setup(_, nuxt) {
    nuxt.options.css.push('@injectivelabs/injective-ui/lib/tailwind.css')
  },
  hooks: {
    'components:dirs'(dirs) {
      dirs.push({
        path: fileURLToPath(new URL('./../lib/components', import.meta.url)),
        prefix: 'base'
      })
    }
  }
})
