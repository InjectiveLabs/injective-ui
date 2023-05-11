import path from 'path'
import { Config } from 'tailwindcss'

export default <Config>{
  presets: [require('../lib/tailwind-preset.cjs')],
  content: [
    /*
      historie requires the full path to the components folder
      https://tailwindcss.com/docs/content-configuration#working-with-third-party-libraries
    */
    path.resolve(__dirname, './../lib/components/*.vue'),
    path.resolve(__dirname, './../lib/icons/*.vue'),
    path.resolve(__dirname, './../playground/story/*.vue')
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
