// not used, keeping this as a safeguard incase we want to remove import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineNuxtPlugin(() => {
  console.log('buffer init!!')

  import('buffer/').then((Buffer) => {
    console.log('buffer loaded!!')

    window.Buffer = window.Buffer || Buffer.default.Buffer
    globalThis.Buffer = window.Buffer || Buffer.default.Buffer
  })
})
