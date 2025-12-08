/**
 * Manual chunk configuration for Rollup/Vite builds.
 *
 * This module defines how node_modules dependencies are grouped into chunks
 * for optimal loading performance across all Injective apps.
 *
 * @see https://rollupjs.org/configuration-options/#output-manualchunks
 */

/**
 * Chunk group definitions for manual code splitting.
 *
 * Each group defines:
 * - name: The output chunk name
 * - test: Function to match module IDs
 * - priority: Higher priority groups are checked first (important for overlapping patterns)
 *
 * Best practices from Rollup docs:
 * - Check specific patterns before generic ones (via priority)
 * - Group related dependencies that are typically used together
 * - Keep chunks at reasonable sizes (aim for 50-200KB gzipped)
 */
const CHUNK_GROUPS = [
  // Wallet-specific packages (high priority - check before generic @injectivelabs)
  // Split into individual chunks to respect dynamic imports in wallet-strategy
  {
    name: 'keplr',
    test: (id: string) => id.includes('@keplr-wallet'),
    priority: 100
  },
  // Heavy/rarely-used wallet packages - keep separate for lazy loading
  {
    name: 'wallet-trezor',
    test: (id: string) => id.includes('@injectivelabs/wallet-trezor'),
    priority: 95
  },
  {
    name: 'wallet-ledger',
    test: (id: string) => id.includes('@injectivelabs/wallet-ledger'),
    priority: 95
  },
  {
    name: 'wallet-magic',
    test: (id: string) => id.includes('@injectivelabs/wallet-magic'),
    priority: 95
  },
  {
    name: 'wallet-turnkey',
    test: (id: string) => id.includes('@injectivelabs/wallet-turnkey'),
    priority: 95
  },
  {
    name: 'wallet-wallet-connect',
    test: (id: string) => id.includes('@injectivelabs/wallet-wallet-connect'),
    priority: 95
  },
  // Core wallet packages that are always needed
  {
    name: 'injective-wallet',
    test: (id: string) => id.includes('@injectivelabs/wallet'),
    priority: 90
  },

  // Third-party wallet SDKs (lazy-loaded with their wallet packages)
  {
    name: 'turnkey-sdk',
    test: (id: string) => id.includes('@turnkey'),
    priority: 85
  },
  {
    name: 'ledger-sdk',
    test: (id: string) => id.includes('@ledgerhq'),
    priority: 85
  },
  {
    name: 'trezor-sdk',
    test: (id: string) => id.includes('@trezor'),
    priority: 85
  },
  {
    name: 'walletconnect-sdk',
    test: (id: string) =>
      id.includes('@walletconnect') || id.includes('@web3modal'),
    priority: 85
  },

  // Cosmos ecosystem
  {
    name: 'cosmjs',
    test: (id: string) => id.includes('@cosmjs'),
    priority: 80
  },

  // Ethereum ecosystem
  {
    name: 'ethers',
    test: (id: string) =>
      id.includes('@ethersproject') || id.includes('/ethers/'),
    priority: 80
  },
  {
    name: 'viem',
    test: (id: string) => id.includes('/viem/'),
    priority: 80
  },

  // Serialization
  {
    name: 'protobuf',
    test: (id: string) =>
      id.includes('protobufjs') || id.includes('google-protobuf'),
    priority: 70
  },

  // UI/visualization (large, often lazy-loaded)
  {
    name: 'charts',
    test: (id: string) =>
      id.includes('apexcharts') || id.includes('highcharts'),
    priority: 60
  },
  {
    name: 'lottie',
    test: (id: string) => id.includes('lottie-web'),
    priority: 60
  },
  {
    name: 'ace-editor',
    test: (id: string) => id.includes('ace-builds'),
    priority: 60
  },

  // Injective SDK (lower priority - after wallet packages)
  {
    name: 'injective-sdk',
    test: (id: string) => id.includes('@injectivelabs'),
    priority: 50
  },

  // Crypto primitives
  {
    name: 'noble-crypto',
    test: (id: string) => id.includes('@noble'),
    priority: 40
  }
] as const

// Sort by priority (highest first) at module load time
const SORTED_CHUNK_GROUPS = [...CHUNK_GROUPS].sort(
  (a, b) => b.priority - a.priority
)

// Cache for chunk name lookups (performance optimization for large builds)
const chunkCache = new Map<string, string | undefined>()

/**
 * Manual chunks function following Rollup best practices.
 *
 * Key principles:
 * 1. Only split node_modules (let Nuxt/Vite handle app code)
 * 2. Group related packages that are used together
 * 3. Use priority ordering for overlapping patterns
 * 4. Return undefined for non-matching modules (let Rollup decide)
 *
 * @param id - The module ID (file path) being processed by Rollup
 * @returns The chunk name to assign, or undefined to let Rollup decide
 *
 * @example
 * // In vite config:
 * build: {
 *   rollupOptions: {
 *     output: {
 *       manualChunks
 *     }
 *   }
 * }
 */
export function manualChunks(id: string): string | undefined {
  // Skip non-node_modules (let Nuxt handle app code splitting)
  if (!id.includes('node_modules')) {
    return undefined
  }

  // Check cache first
  if (chunkCache.has(id)) {
    return chunkCache.get(id)
  }

  // Find matching chunk group (sorted by priority)
  let chunkName: string | undefined
  for (const group of SORTED_CHUNK_GROUPS) {
    if (group.test(id)) {
      chunkName = group.name
      break
    }
  }

  // Cache and return result
  chunkCache.set(id, chunkName)

  return chunkName
}
