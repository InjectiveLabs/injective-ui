export default defineNuxtPlugin(() => {
  // Polyfill Buffer for browser environments
  import('buffer/').then((Buffer) => {
    window.Buffer = window.Buffer || Buffer.default.Buffer
    globalThis.Buffer = window.Buffer || Buffer.default.Buffer
  })
})
