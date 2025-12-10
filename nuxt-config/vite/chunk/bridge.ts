/**
 * Bridge app chunk configuration overrides.
 *
 * Bridge has specific requirements due to Wormhole/Solana integration:
 * 1. Solana ecosystem packages must be bundled together (circular dependencies)
 * 2. protobufjs must be bundled with CosmJs (initialization order)
 * 3. @turnkey and @reown excluded from wallet chunks (go to solana-ecosystem)
 */

/**
 * Chunk group definition type.
 */
export interface ChunkGroup {
  name: string
  priority: number
  test: (id: string) => boolean
}

/**
 * Solana ecosystem chunk name.
 */
export const SOLANA_ECOSYSTEM_CHUNK = 'solana-ecosystem'

/**
 * Packages that must be bundled together due to circular dependencies.
 * These cause "Cannot access X before initialization" errors when split.
 */
const SOLANA_ECOSYSTEM_PATTERNS = [
  // Solana core
  '@solana',
  '@solana-program',
  // Wormhole uses Solana
  '@wormhole-foundation',
  // Anchor/Serum use Solana
  '@coral-xyz',
  '@project-serum',
  // Packages that depend on Solana
  '@reown',
  '@turnkey',
  // EventEmitter dependencies - rpc-websockets extends eventemitter3
  'eventemitter3',
  'rpc-websockets',
  // Borsh serialization used by Solana
  '/borsh/',
  'node_modules/borsh',
  // Other Solana dependencies
  'superstruct',
  'jayson'
]

/**
 * Check if a module belongs to the Solana ecosystem.
 */
export function isSolanaEcosystem(id: string): boolean {
  return SOLANA_ECOSYSTEM_PATTERNS.some((pattern) => id.includes(pattern))
}

/**
 * Bridge-specific chunk overrides.
 *
 * These replace the shared chunks with the same name:
 * - WalletTurnkey: excludes @turnkey (goes to solana-ecosystem)
 * - WalletWalletConnect: excludes @reown (goes to solana-ecosystem)
 * - CosmJs: includes protobufjs (initialization order fix)
 * - Protobuf: only google-protobuf (protobufjs is in CosmJs)
 */
export function getBridgeChunkOverrides(): ChunkGroup[] {
  return [
    // Turnkey: wallet package only (NOT @turnkey - goes to solana-ecosystem)
    {
      name: 'wallet-turnkey',
      test: (id: string) => id.includes('@injectivelabs/wallet-turnkey'),
      priority: 96
    },
    // WalletConnect: NO @reown (goes to solana-ecosystem)
    {
      name: 'wallet-wallet-connect',
      test: (id: string) =>
        id.includes('@injectivelabs/wallet-wallet-connect') ||
        id.includes('@walletconnect') ||
        id.includes('@web3modal'),
      priority: 95
    },
    // CosmJs + protobufjs (initialization order fix)
    {
      name: 'cosmjs',
      test: (id: string) =>
        id.includes('@cosmjs') ||
        id.includes('cosmjs-types') ||
        id.includes('protobufjs'),
      priority: 83
    },
    // Protobuf: only google-protobuf (protobufjs is in CosmJs)
    {
      name: 'protobuf',
      test: (id: string) => id.includes('google-protobuf'),
      priority: 70
    }
  ]
}
