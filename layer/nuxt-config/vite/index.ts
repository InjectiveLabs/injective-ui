import { defineConfig } from 'vite'
import { ViteConfig } from '@nuxt/schema'
import { createResolver } from '@nuxt/kit'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nodePolyfills } from '@bangjelkoski/vite-plugin-node-polyfills'
import { IS_BRIDGE, IS_HELIX, IS_EXPLORER } from './../../utils/constant'

const isLocalLayer = process.env.LOCAL_LAYER === 'true'
const isProduction = process.env.NODE_ENV === 'production'

const buildSourceMap = process.env.BUILD_SOURCEMAP !== 'false'
const { resolve } = createResolver(import.meta.url)

// deps affecting local build against github source
const additionalDeps = [
  'bs58',
  'bn.js',
  'aes-js',
  'hash.js',
  'js-sha3',
  'eventemitter3',
  '@solana/web3.js',
  '@cosmjs/stargate',
  '@cosmjs/launchpad',
  '@solana/buffer-layout',
  'qr-code-generator-vue3',
  '@injectivelabs/grpc-web',
  'jayson/lib/client/browser',
  '@ethersproject/json-wallets',
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

          if (id.includes('@injectivelabs/wallet')) {
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
          'date-fns',
          'vue-imask',
          'vue-hotjar',
          'apexcharts',
          'lottie-web',
          'js-confetti',
          'date-fns-tz',
          'floating-vue',
          'tailwind-merge',
          'canvas-confetti',
          'mixpanel-browser',
          'lightweight-charts',
          '@injectivelabs/utils',
          '@injectivelabs/sdk-ts',
          'qr-code-generator-vue3',
          'class-variance-authority',
          '@injectivelabs/wallet-evm',
          '@injectivelabs/wallet-base',
          '@injectivelabs/wallet-core',
          '@injectivelabs/wallet-ledger',
          '@injectivelabs/wallet-cosmos',
          '@injectivelabs/wallet-strategy',
          '@injectivelabs/wallet-cosmostation',
          '@injectivelabs/wallet-cosmos-strategy',
          ...(isLocalLayer ? [] : additionalDeps),
          ...(IS_BRIDGE
            ? [
                'axios',
                'ethers',
                'js-sha3',
                'js-base64',
                'alchemy-sdk',
                '@solana/web3.js',
                '@ethersproject/bytes',
                '@wormhole-foundation/sdk',
                '@bangjelkoski/ens-validation',
                '@injectivelabs/sdk-ts/cosmjs',
                '@wormhole-foundation/sdk/evm',
                '@wormhole-foundation/sdk/solana',
                '@wormhole-foundation/sdk/cosmwasm'
              ]
            : []),
          ...(IS_HELIX
            ? [
                'gsap',
                'gsap/ScrollTrigger',
                'gsap/ScrollToPlugin',
                'html-to-image'
              ]
            : []),
          ...(IS_EXPLORER
            ? [
                'v-calendar',
                'vue3-ace-editor',
                'ace-builds/src-noconflict/mode-json',
                'ace-builds/src-noconflict/theme-chrome'
              ]
            : [])
        ],
    exclude: ['fsevents']
  }
}) as ViteConfig

export const vitePlugins = [
  { src: resolve('./../../nuxt-config/buffer.ts'), ssr: false }
]
