import { fileURLToPath } from 'node:url'
import {
  useLogger,
  addImportsDir,
  createResolver,
  defineNuxtModule
} from '@nuxt/kit'

export * from '../lib/types'

export interface ModuleOptions {
  /**
   * @default 'devnet'
   */
  network?: string
}

const defaultOptions = {
  network: 'devnet'
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'base',
    configKey: 'base'
  },
  defaults: {
    network: 'devnet'
  },
  setup(userOptions, nuxt) {
    const logger = useLogger('ui-shared')
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.public.base = {
      ...userOptions,
      ...defaultOptions
    }

    logger.success(
      `Instantiated ui-shared with ${
        (nuxt.options.runtimeConfig.public.base as ModuleOptions).network
      }`
    )

    nuxt.options.css.unshift('@injectivelabs/ui-shared/lib/tailwind.css')

    // import helper functions
    addImportsDir(resolve('./../lib/helper'))
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
