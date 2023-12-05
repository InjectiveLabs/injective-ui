export function vitePolyfills() {
  let addedPolyfills = false
  return {
    name: 'vite-polyfills',
    transform(src: string, id: string) {
      if (!addedPolyfills && /\.m?js$/.test(id)) {
        addedPolyfills = true
        return {
          code: [
            `import { Buffer as ___Buffer } from 'buffer'; window.Buffer = ___Buffer;`,
            `import * as ___process from 'process'; window.process = ___process;`,
            `window.global = window;`,
            src
          ].join('\n')
        }
      }
    }
  }
}
