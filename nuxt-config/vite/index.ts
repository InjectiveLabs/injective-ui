import { defineConfig } from 'vite'
import { manualChunks } from './chunk'
import { visualizer } from 'rollup-plugin-visualizer'
import type { ViteConfig } from '@nuxt/schema'

export { manualChunks } from './chunk'

const isLocalLayer = process.env.LOCAL_LAYER === 'true'
const isProduction = process.env.NODE_ENV === 'production'
const isAnalyzeBundle = process.env.ANALYZE_BUNDLE === 'true'

const buildSourceMap = process.env.BUILD_SOURCEMAP !== 'false'

/**
 * Base dependencies that ALL apps need from the layer.
 * Uses glob patterns for packages with subpath exports.
 *
 * @see /guides/OPTIMIZE_DEPS.md for documentation
 */
const BASE_OPTIMIZE_DEPS = [
  // Core utilities
  'ethers',
  'viem',
  'date-fns',
  'date-fns-tz',
  'tailwind-merge',
  'class-variance-authority',

  // Vue ecosystem
  'vue-imask',
  'vue-hotjar',
  'vue-gtag',
  'vee-validate',
  '@vue/devtools-core',
  '@vue/devtools-kit',

  // i18n internals (transitive deps of @nuxtjs/i18n)
  '@intlify/shared',
  '@intlify/core-base',

  // UI libraries
  'apexcharts',
  'lottie-web',
  'js-confetti',
  'canvas-confetti',
  'mixpanel-browser',

  // Injective packages - using glob patterns for subpath exports
  '@injectivelabs/sdk-ts/**',
  '@injectivelabs/utils',
  '@injectivelabs/ts-types',
  '@injectivelabs/networks',
  '@injectivelabs/exceptions',

  // Wallet packages (only core - others are lazy-loaded by wallet-strategy)
  '@injectivelabs/wallet-evm',
  '@injectivelabs/wallet-base',
  '@injectivelabs/wallet-core',
  '@injectivelabs/wallet-cosmos',
  '@injectivelabs/wallet-strategy',

  // Other common deps
  '@metamask/eth-sig-util',
  '@bangjelkoski/ens-validation',
  'axios',
  'http-status-codes',
  'qr-code-styling'
]

/**
 * Transitive dependencies needed when building against remote GitHub layer.
 * These are deps-of-deps that Vite can't discover from remote layers.
 *
 * Only included when LOCAL_LAYER !== 'true'
 */
const REMOTE_LAYER_TRANSITIVE_DEPS = [
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
  '@injectivelabs/grpc-web',
  'jayson/lib/client/browser',
  '@ethersproject/json-wallets',
  '@cosmostation/extension-client',
  'jayson/lib/client/browser/index',
  '@cosmostation/extension-client/error',
  '@cosmostation/extension-client/index'
]

export function buildOptimizeDepsInclude(
  appSpecificDeps: string[] = []
): string[] {
  if (isProduction) {
    return []
  }

  const deps = [
    ...BASE_OPTIMIZE_DEPS,
    ...appSpecificDeps,
    // Include remote layer deps only when not using local layer
    ...(isLocalLayer ? [] : REMOTE_LAYER_TRANSITIVE_DEPS)
  ]

  // Deduplicate
  return [...new Set(deps)]
}

export default defineConfig({
  define: {
    global: 'globalThis'
  },

  plugins: [
    isAnalyzeBundle
      ? visualizer({
          open: true,
          filename: 'stats.html',
          gzipSize: true,
          brotliSize: true
        })
      : undefined
  ].filter(Boolean),

  resolve: {
    // Dedupe packages that MUST be singletons (shared global state)
    dedupe: ['vee-validate', 'vue', 'viem', 'ox', 'abitype']
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

  build: {
    sourcemap: buildSourceMap,

    rollupOptions: {
      output: {
        manualChunks,
        // Include chunk name in filename for better debugging/caching
        chunkFileNames: '_nuxt/[name]-[hash].js'
      }
    },

    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },

  optimizeDeps: {
    exclude: ['fsevents'],
    include: [...buildOptimizeDepsInclude()]
  }
}) as ViteConfig
