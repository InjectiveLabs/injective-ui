import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vite'
import { ViteConfig } from '@nuxt/schema'
import { createResolver } from '@nuxt/kit'
import { nodePolyfills } from '@bangjelkoski/vite-plugin-node-polyfills'

const buildSourceMap = process.env.BUILD_SOURCEMAP !== 'false'
const { resolve } = createResolver(import.meta.url)

export default defineConfig({
  plugins: [tsconfigPaths(), nodePolyfills({ protocolImports: true })],

  build: {
    sourcemap: buildSourceMap,

    rollupOptions: {
      cache: false,
      output: {
        manualChunks: (id: string) => {
          if (id.includes('@keplr-wallet')) {
            return 'keplr'
          }

          if (id.includes('@injectivelabs/wallet-ts')) {
            return 'injective-wallet'
          }

          if (id.includes('@cosmjs')) {
            return 'cosmjs'
          }

          if (id.includes('@injectivelabs')) {
            return 'injective'
          }
        }
      }
    }
  },

  server: {
    watch: {
      usePolling: true
    },

    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  },

  optimizeDeps: {
    include: [
      'date-fns',
      'vue-imask',
      'apexcharts',
      'lottie-web',
      'js-confetti',
      'date-fns-tz',
      'floating-vue',
      'canvas-confetti',
      'lightweight-charts',
      '@injectivelabs/sdk-ts',
      '@injectivelabs/wallet-ts',
      '@vueuse/integrations/useQRCode'
    ],
    exclude: ['fsevents']
  }
}) as ViteConfig

export const vitePlugins = [
  { src: resolve('./../../nuxt-config/buffer.ts'), ssr: false }
]
