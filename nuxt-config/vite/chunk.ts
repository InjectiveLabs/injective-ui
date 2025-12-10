/**
 * Manual chunk configuration for Rollup/Vite builds.
 *
 * This module defines how node_modules dependencies are grouped into chunks
 * for optimal loading performance across all Injective apps.
 *
 * @see https://rollupjs.org/configuration-options/#output-manualchunks
 */

/**
 * Chunk names used for manual code splitting.
 * These names are used in the build:manifest hook to control modulepreload behavior.
 *
 * NOTE: Using regular enum instead of const enum.
 * const enum values are inlined at compile time which causes issues
 * when the layer is consumed from a remote source (GitHub).
 * Regular enums work correctly across module boundaries.
 */
export enum ChunkName {
  // Wallet-specific packages (bundled with their SDKs)
  Keplr = 'keplr',
  WalletLedger = 'wallet-ledger', // includes @ledgerhq/*
  WalletTrezor = 'wallet-trezor', // includes @trezor/*
  WalletMagic = 'wallet-magic',
  WalletTurnkey = 'wallet-turnkey', // includes @turnkey/*
  WalletWalletConnect = 'wallet-wallet-connect', // includes @walletconnect/*, @web3modal/*, @reown/*
  InjectiveWallet = 'injective-wallet',

  // Polyfills (needed by multiple chunks, separate to avoid duplication)
  BufferPolyfill = 'buffer-polyfill',

  // Cosmos ecosystem (includes protobufjs to avoid circular deps)
  CosmJs = 'cosmjs',

  // Ethereum ecosystem
  Ethers = 'ethers',
  Viem = 'viem',

  // UI/visualization
  Charts = 'charts',
  Lottie = 'lottie',
  AceEditor = 'ace-editor',

  // Injective proto packages
  ProtoOlp = 'proto-olp',
  ProtoCore = 'proto-core',
  ProtoMito = 'proto-mito',
  ProtoAbacus = 'proto-abacus',
  ProtoIndexer = 'proto-indexer',

  // Injective SDK
  InjectiveSdk = 'injective-sdk',

  // Crypto primitives
  BnJsElliptic = 'bn-elliptic', // bn.js and elliptic must stay together due to tight coupling
  NobleCrypto = 'noble-crypto'
}

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
  // Each wallet package is bundled with its third-party SDK
  {
    name: ChunkName.Keplr,
    test: (id: string) => id.includes('@keplr-wallet'),
    priority: 100
  },
  // Ledger: wallet package + @ledgerhq SDK
  {
    name: ChunkName.WalletLedger,
    test: (id: string) =>
      id.includes('@injectivelabs/wallet-ledger') || id.includes('@ledgerhq'),
    priority: 99
  },
  // Trezor: wallet package + @trezor SDK
  {
    name: ChunkName.WalletTrezor,
    test: (id: string) =>
      id.includes('@injectivelabs/wallet-trezor') || id.includes('@trezor'),
    priority: 98
  },
  {
    name: ChunkName.WalletMagic,
    test: (id: string) => id.includes('@injectivelabs/wallet-magic'),
    priority: 97
  },
  // Turnkey: wallet package + @turnkey SDK
  {
    name: ChunkName.WalletTurnkey,
    test: (id: string) =>
      id.includes('@injectivelabs/wallet-turnkey') || id.includes('@turnkey'),
    priority: 96
  },
  // WalletConnect: wallet package + @walletconnect, @web3modal, @reown SDKs
  {
    name: ChunkName.WalletWalletConnect,
    test: (id: string) =>
      id.includes('@injectivelabs/wallet-wallet-connect') ||
      id.includes('@walletconnect') ||
      id.includes('@web3modal') ||
      id.includes('@reown'),
    priority: 95
  },
  // Core wallet packages that are always needed
  {
    name: ChunkName.InjectiveWallet,
    test: (id: string) => id.includes('@injectivelabs/wallet'),
    priority: 90
  },

  // Buffer polyfill - needed by ethers, protobuf, cosmjs
  // Must be separate from cosmjs so it can be loaded independently
  {
    name: ChunkName.BufferPolyfill,
    test: (id: string) =>
      id.includes('/buffer/') || id.includes('node_modules/buffer'),
    priority: 87
  },

  // bn.js + elliptic - must stay together due to tight coupling and initialization order
  {
    name: ChunkName.BnJsElliptic,
    test: (id: string) =>
      id.includes('/bn.js/') ||
      id.includes('node_modules/bn.js') ||
      id.includes('/elliptic/') ||
      id.includes('node_modules/elliptic'),
    priority: 86
  },

  // Cosmos ecosystem - @cosmjs packages + protobufjs (must be together to avoid circular deps)
  // Rollup places shared CommonJS interop code in cosmjs, which protobufjs needs
  // Separating them causes circular imports and runtime initialization errors
  {
    name: ChunkName.CosmJs,
    test: (id: string) =>
      id.includes('@cosmjs') ||
      id.includes('cosmjs-types') ||
      id.includes('protobufjs') ||
      id.includes('google-protobuf'),
    priority: 85
  },

  // Ethereum ecosystem
  {
    name: ChunkName.Ethers,
    test: (id: string) =>
      id.includes('@ethersproject') || id.includes('/ethers/'),
    priority: 82
  },
  {
    name: ChunkName.Viem,
    test: (id: string) => id.includes('/viem/'),
    priority: 81
  },

  // UI/visualization (large, often lazy-loaded)
  {
    name: ChunkName.Charts,
    test: (id: string) =>
      id.includes('apexcharts') || id.includes('highcharts'),
    priority: 63
  },
  {
    name: ChunkName.Lottie,
    test: (id: string) => id.includes('lottie-web'),
    priority: 62
  },
  {
    name: ChunkName.AceEditor,
    test: (id: string) => id.includes('ace-builds'),
    priority: 61
  },

  // Injective proto packages (split by module for better code-splitting)
  // These are the heaviest dependencies - splitting allows unused protos to be excluded
  {
    name: ChunkName.ProtoCore,
    test: (id: string) => id.includes('@injectivelabs/core-proto-ts'),
    priority: 59
  },
  {
    name: ChunkName.ProtoIndexer,
    test: (id: string) => id.includes('@injectivelabs/indexer-proto-ts'),
    priority: 58
  },
  {
    name: ChunkName.ProtoMito,
    test: (id: string) => id.includes('@injectivelabs/mito-proto-ts'),
    priority: 57
  },
  {
    name: ChunkName.ProtoAbacus,
    test: (id: string) => id.includes('@injectivelabs/abacus-proto-ts'),
    priority: 56
  },
  {
    name: ChunkName.ProtoOlp,
    test: (id: string) => id.includes('@injectivelabs/olp-proto-ts'),
    priority: 55
  },

  // Injective SDK (lower priority - after wallet and proto packages)
  {
    name: ChunkName.InjectiveSdk,
    test: (id: string) => id.includes('@injectivelabs'),
    priority: 50
  },

  // Crypto primitives
  {
    name: ChunkName.NobleCrypto,
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
