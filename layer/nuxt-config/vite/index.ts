import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vite'
import { ViteConfig } from '@nuxt/schema'
import { createResolver } from '@nuxt/kit'
import { nodePolyfills } from '@bangjelkoski/vite-plugin-node-polyfills'

const isLocalLayer = process.env.LOCAL_LAYER === 'true'
const isProduction = process.env.NODE_ENV === 'production'

const buildSourceMap = process.env.BUILD_SOURCEMAP !== 'false'
const { resolve } = createResolver(import.meta.url)

// deps affecting local build against github source
const additionalDeps = [
  'bs58',
  'bn.js',
  'eventemitter3',
  '@solana/web3.js',
  '@cosmjs/stargate',
  '@cosmjs/launchpad',
  '@solana/buffer-layout',
  '@injectivelabs/grpc-web',
  'jayson/lib/client/browser',
  '@cosmostation/extension-client',
  'jayson/lib/client/browser/index',
  '@cosmostation/extension-client/error',
  '@cosmostation/extension-client/index'
]

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
    include: isProduction
      ? []
      : [
          'tailwind-merge',
          'class-variance-authority',
          'mixpanel-browser',
          'date-fns',
          'vue-imask',
          'vue-hotjar',
          'apexcharts',
          'lottie-web',
          'js-confetti',
          'date-fns-tz',
          'floating-vue',
          'canvas-confetti',
          'lightweight-charts',
          '@injectivelabs/utils',
          '@injectivelabs/sdk-ts',
          '@injectivelabs/wallet-ts',
          '@vueuse/integrations/useQRCode',
          ...(isLocalLayer ? [] : additionalDeps)
        ],
    exclude: ['fsevents']
  }
}) as ViteConfig

export const vitePlugins = [
  { src: resolve('./../../nuxt-config/buffer.ts'), ssr: false }
]
