import { defineConfig } from 'vitest/config'
import Components from 'unplugin-vue-components/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue() as any,
    Components({
      dirs: ['./lib/components'],
      directoryAsNamespace: true
    })
  ],
  test: {
    dangerouslyIgnoreUnhandledErrors: true,
    environment: 'jsdom',
    globals: true,
    testTimeout: 30 * 1000,
    minThreads: 3,
    maxThreads: 3,
    include: ['./lib/**/*.spec.ts']
  }
})
