import { fileURLToPath } from 'node:url'
import { Config } from 'tailwindcss'

export default <Config>{
  // presets: [require('../lib/tailwind-preset.cjs')],
  content: [
    /*
      historie requires the full path to the components folder
      https://tailwindcss.com/docs/content-configuration#working-with-third-party-libraries
    */
    fileURLToPath(new URL('./../lib/components/*.vue', import.meta.url)),
    fileURLToPath(new URL('./../lib/icons/*.vue', import.meta.url)),
    fileURLToPath(new URL('./../playground/story/*.vue', import.meta.url))
  ]
}
