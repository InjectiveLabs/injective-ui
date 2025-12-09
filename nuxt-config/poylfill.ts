console.log('hello world! from polyfill.ts')

export default defineNuxtPlugin(() => {
  console.log('buffer init!!')

  import('buffer/').then((Buffer) => {
    console.log('buffer loaded!!')

    window.Buffer = window.Buffer || Buffer.default.Buffer
    globalThis.Buffer = window.Buffer || Buffer.default.Buffer
  })
})
