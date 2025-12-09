import { defineConfig } from 'vite'
import { manualChunks } from './chunk'
import { fileURLToPath } from 'node:url'
import { visualizer } from 'rollup-plugin-visualizer'
import {
  IS_MITO,
  IS_HELIX,
  IS_BRIDGE,
  IS_EXPLORER,
  IS_ADMIN_UI,
  IS_TRADING_UI
} from '../../app/utils/constant'
import type { ViteConfig } from '@nuxt/schema'

// Crypto stub path for aliasing - breaks static import chain to cosmjs
const cryptoStubPath = fileURLToPath(
  new URL('./crypto-stub.ts', import.meta.url)
)

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
  '@injectivelabs/wallet-base',
  '@injectivelabs/wallet-core',
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

/**
 * App-specific dependencies (fallback for apps not yet migrated).
 * Apps should migrate to using buildOptimizeDepsInclude() directly.
 *
 * @deprecated Apps should use buildOptimizeDepsInclude() in their own config
 */
const APP_SPECIFIC_DEPS: Record<string, string[]> = {
  mito: ['floating-vue'],
  bridge: [
    'js-sha3',
    'js-base64',
    'floating-vue',
    '@solana/web3.js',
    '@ethersproject/bytes',
    '@wormhole-foundation/sdk',
    '@wormhole-foundation/sdk/evm',
    '@wormhole-foundation/sdk/solana',
    '@wormhole-foundation/sdk/cosmwasm'
  ],
  adminUi: ['@vuepic/vue-datepicker'],
  helix: [
    'gsap',
    'html-to-image',
    'embla-carousel-vue',
    'gsap/ScrollTrigger',
    'gsap/ScrollToPlugin'
  ],
  explorer: [
    'v-calendar',
    'vue3-ace-editor',
    'ace-builds/src-noconflict/mode-json',
    'ace-builds/src-noconflict/theme-chrome'
  ],
  tradingUi: [
    '@shared/types',
    '@shared/data/token',
    '@shared/WalletService',
    '@shared/utils/formatter',
    '@shared/transformer/market',
    '@shared/transformer/oracle'
  ]
}

/**
 * Builds the optimizeDeps.include array for your app.
 *
 * @param appSpecificDeps - Dependencies specific to your app
 * @returns Combined array of base + remote + app-specific deps
 *
 * @example
 * // In your app's nuxt.config.ts:
 * import { buildOptimizeDepsInclude } from '../injective-ui/nuxt-config/vite'
 *
 * export default defineNuxtConfig({
 *   vite: {
 *     optimizeDeps: {
 *       include: buildOptimizeDepsInclude([
 *         'highcharts',
 *         'some-other-package',
 *       ])
 *     }
 *   }
 * })
 */
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

/**
 * Gets the legacy app-specific deps based on IS_* flags.
 * This is for backwards compatibility with apps not yet migrated.
 *
 * @deprecated Apps should use buildOptimizeDepsInclude() directly
 */
function getLegacyAppSpecificDeps(): string[] {
  const deps: string[] = []

  if (IS_MITO && APP_SPECIFIC_DEPS.mito) deps.push(...APP_SPECIFIC_DEPS.mito)
  if (IS_BRIDGE && APP_SPECIFIC_DEPS.bridge)
    deps.push(...APP_SPECIFIC_DEPS.bridge)
  if (IS_ADMIN_UI && APP_SPECIFIC_DEPS.adminUi)
    deps.push(...APP_SPECIFIC_DEPS.adminUi)
  if (IS_HELIX && APP_SPECIFIC_DEPS.helix) deps.push(...APP_SPECIFIC_DEPS.helix)
  if (IS_EXPLORER && APP_SPECIFIC_DEPS.explorer)
    deps.push(...APP_SPECIFIC_DEPS.explorer)
  if (IS_TRADING_UI && APP_SPECIFIC_DEPS.tradingUi)
    deps.push(...APP_SPECIFIC_DEPS.tradingUi)

  return deps
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
    alias: {
      buffer: 'buffer/',
      // Stub out Node.js crypto module to prevent static import chain to cosmjs.
      // CommonJS packages like crypto-js and elliptic have fallback code:
      //   if (!globalThis.crypto) { require('crypto') }
      // Rollup resolves this to cosmjs's crypto module, creating a static import
      // even though the fallback is never used at runtime (browsers have native crypto).
      // By aliasing to empty stub, we break this chain and allow cosmjs to lazy-load.
      crypto: cryptoStubPath
    },
    // Dedupe packages that MUST be singletons (shared global state)
    // vee-validate uses a global rules registry - multiple instances break rule lookups
    dedupe: ['vee-validate', 'vue']
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
      transformMixedEsModules: true,
      // Ignore Node.js crypto require calls to prevent cosmjs being pulled into bundle.
      // CommonJS packages like crypto-js and elliptic have fallback code:
      //   if (!globalThis.crypto) { require('crypto') }
      // The fallback is never used at runtime (browsers have native crypto).
      ignore: ['crypto']
    }
  },

  optimizeDeps: {
    exclude: ['fsevents'],
    include: [
      'buffer/',
      ...buildOptimizeDepsInclude(getLegacyAppSpecificDeps())
    ]
  }
}) as ViteConfig
