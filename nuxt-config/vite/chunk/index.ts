/**
 * Manual chunk configuration for Rollup/Vite builds.
 *
 * This module defines how node_modules dependencies are grouped into chunks
 * for optimal loading performance across all Injective apps.
 *
 * Structure:
 * - index.ts: Shared chunk groups, ChunkName enum, manualChunks function
 * - bridge.ts: Bridge-specific overrides and Solana ecosystem handling
 * - hub.ts: Hub-specific overrides (currently empty, uses shared config)
 *
 * @see https://rollupjs.org/configuration-options/#output-manualchunks
 */

import { getHubChunkOverrides } from './hub'
import { IS_BRIDGE } from '../../../app/utils/constant/setup'
import {
  type ChunkGroup,
  isSolanaEcosystem,
  SOLANA_ECOSYSTEM_CHUNK,
  getBridgeChunkOverrides
} from './bridge'

// Re-export ChunkGroup type for external use
export type { ChunkGroup }

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
  // Core dependencies (must load first)
  EventEmitter = 'eventemitter',

  // Wallet-specific packages (bundled with their SDKs)
  Keplr = 'keplr',
  WalletLedger = 'wallet-ledger',
  WalletTrezor = 'wallet-trezor',
  WalletMagic = 'wallet-magic',
  WalletTurnkey = 'wallet-turnkey',
  WalletWalletConnect = 'wallet-wallet-connect',
  InjectiveWallet = 'injective-wallet',

  // Polyfills
  BufferPolyfill = 'buffer-polyfill',

  // Cosmos ecosystem
  CosmJs = 'cosmjs',

  // Ethereum ecosystem
  Ethers = 'ethers',
  Viem = 'viem',
  AbiType = 'abitype',

  // Serialization
  Protobuf = 'protobuf',

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
  BnJsElliptic = 'bn-elliptic',
  NobleCrypto = 'noble-crypto'
}

/**
 * Shared chunk groups used by all apps.
 * App-specific overrides are merged on top of these.
 */
const SHARED_CHUNK_GROUPS: ChunkGroup[] = [
  // Core dependencies (highest priority - must load before everything else)
  // EventEmitter is extended by StreamManagerV2 and other classes in @injectivelabs/sdk-ts
  // If it ends up in a different chunk, we get TDZ (Temporal Dead Zone) errors
  {
    name: ChunkName.EventEmitter,
    test: (id: string) => id.includes('eventemitter3'),
    priority: 150
  },

  // Wallet-specific packages (high priority - check before generic @injectivelabs)
  {
    name: ChunkName.Keplr,
    test: (id: string) => id.includes('@keplr-wallet'),
    priority: 100
  },
  {
    name: ChunkName.WalletLedger,
    test: (id: string) =>
      id.includes('@injectivelabs/wallet-ledger') || id.includes('@ledgerhq'),
    priority: 99
  },
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
  {
    name: ChunkName.WalletTurnkey,
    test: (id: string) =>
      id.includes('@injectivelabs/wallet-turnkey') || id.includes('@turnkey'),
    priority: 96
  },
  {
    name: ChunkName.WalletWalletConnect,
    test: (id: string) =>
      id.includes('@injectivelabs/wallet-wallet-connect') ||
      id.includes('@reown'),
    priority: 95
  },
  {
    name: ChunkName.InjectiveWallet,
    test: (id: string) => id.includes('@injectivelabs/wallet'),
    priority: 90
  },

  // Buffer polyfill
  {
    name: ChunkName.BufferPolyfill,
    test: (id: string) =>
      id.includes('/buffer/') || id.includes('node_modules/buffer'),
    priority: 87
  },

  // bn.js + elliptic - must stay together
  {
    name: ChunkName.BnJsElliptic,
    test: (id: string) =>
      id.includes('/bn.js/') ||
      id.includes('node_modules/bn.js') ||
      id.includes('/elliptic/') ||
      id.includes('node_modules/elliptic'),
    priority: 86
  },

  // ABI type parsing - must be separate to be shared by viem and solana ecosystem
  // Higher priority (84) ensures it's checked before viem (81) and takes precedence over Solana ecosystem
  // Match patterns: /ox@, /ox/, /abitype@, /abitype/
  {
    name: ChunkName.AbiType,
    test: (id: string) => /\/ox[@/]/.test(id) || /\/abitype[@/]/.test(id),
    priority: 84
  },

  // Cosmos ecosystem
  {
    name: ChunkName.CosmJs,
    test: (id: string) => id.includes('@cosmjs') || id.includes('cosmjs-types'),
    priority: 83
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

  // Serialization
  {
    name: ChunkName.Protobuf,
    test: (id: string) =>
      id.includes('protobufjs') || id.includes('google-protobuf'),
    priority: 70
  },

  // UI/visualization
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

  // Injective proto packages
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

  // Injective SDK
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
]

/**
 * Merge app-specific overrides with shared chunk groups.
 * Overrides replace chunks with the same name.
 */
function mergeChunkGroups(
  shared: ChunkGroup[],
  overrides: ChunkGroup[]
): ChunkGroup[] {
  const overrideNames = new Set(overrides.map((o) => o.name))
  const filtered = shared.filter((group) => !overrideNames.has(group.name))

  return [...filtered, ...overrides]
}

/**
 * Build final chunk groups based on current app.
 */
function buildChunkGroups(): ChunkGroup[] {
  const overrides = IS_BRIDGE
    ? getBridgeChunkOverrides()
    : getHubChunkOverrides()
  const merged = mergeChunkGroups(SHARED_CHUNK_GROUPS, overrides)

  return merged.sort((a, b) => b.priority - a.priority)
}

// Build and sort chunk groups at module load time
const SORTED_CHUNK_GROUPS = buildChunkGroups()

// Cache for chunk name lookups
const chunkCache = new Map<string, string | undefined>()

/**
 * Manual chunks function following Rollup best practices.
 *
 * Key principles:
 * 1. Only split node_modules (let Nuxt/Vite handle app code)
 * 2. Group related packages that are used together
 * 3. Use priority ordering for overlapping patterns
 * 4. Apply app-specific handling (e.g., Solana ecosystem for bridge)
 *
 * @param id - The module ID (file path) being processed by Rollup
 * @returns The chunk name to assign, or undefined to let Rollup decide
 */
export function manualChunks(id: string): string | undefined {
  if (!id.includes('node_modules')) {
    return undefined
  }

  // Check cache first
  if (chunkCache.has(id)) {
    return chunkCache.get(id)
  }

  // Bridge-only: Bundle Solana ecosystem packages together
  // This check must happen AFTER priority-based chunk groups are checked
  // to allow higher-priority chunks (like AbiType at priority 84) to take precedence
  if (IS_BRIDGE && isSolanaEcosystem(id)) {
    // First check if this module matches a higher-priority chunk
    for (const group of SORTED_CHUNK_GROUPS) {
      if (group.test(id)) {
        chunkCache.set(id, group.name)

        return group.name
      }
    }
    // If no high-priority match, assign to Solana ecosystem
    chunkCache.set(id, SOLANA_ECOSYSTEM_CHUNK)

    return SOLANA_ECOSYSTEM_CHUNK
  }

  // Check priority-based chunk groups
  let chunkName: string | undefined
  for (const group of SORTED_CHUNK_GROUPS) {
    if (group.test(id)) {
      chunkName = group.name
      break
    }
  }

  chunkCache.set(id, chunkName)

  return chunkName
}
