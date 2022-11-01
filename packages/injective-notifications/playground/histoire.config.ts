import { defineConfig } from 'histoire'
import { HstVue } from '@histoire/plugin-vue'
import { HstNuxt } from '@histoire/plugin-nuxt'

export default defineConfig({
  theme: {
    title: 'Shared components'
  },
  plugins: [HstVue(), HstNuxt()]
})
