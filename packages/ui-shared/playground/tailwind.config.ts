import { fileURLToPath } from 'node:url'
import { Config } from 'tailwindcss'

export default <Config>{
  presets: [require('../lib/tailwind-preset.cjs')],
  content: [
    /*
      historie requires the full path to the components folder
      https://tailwindcss.com/docs/content-configuration#working-with-third-party-libraries
    */
    fileURLToPath(new URL('./../lib/components/*.vue', import.meta.url)),
    fileURLToPath(new URL('./../lib/icons/*.vue', import.meta.url)),
    fileURLToPath(new URL('./../playground/story/*.vue', import.meta.url))
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: '0px 0px 10px rgba(0,0,0, 0.1)',
        'glow-lg': '0px 0px 20px rgba(0,0,0, 0.2)'
      }
    }
  }
}
