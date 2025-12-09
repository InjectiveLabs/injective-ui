import { ChunkName } from './vite/chunk'

/**
 * Chunks to exclude from modulepreload.
 * These are large dependencies that are lazy-loaded or rarely needed on initial page load.
 *
 * Total estimated savings: ~6.5MB raw / ~1.8MB gzipped
 */
const EXCLUDED_PRELOAD_CHUNKS: readonly string[] = [
  // Wallet packages (lazy-loaded when user connects wallet)
  // Each includes its third-party SDK (e.g., wallet-ledger includes @ledgerhq/*)
  ChunkName.WalletWalletConnect, // ~1.1MB (includes @walletconnect, @web3modal, @reown)
  ChunkName.WalletTrezor,
  ChunkName.WalletLedger,
  ChunkName.WalletTurnkey,
  ChunkName.WalletMagic,

  // Large ecosystem dependencies (cosmjs now includes bn.js, elliptic, crypto-js)
  ChunkName.CosmJs,

  // Ethereum libraries (only needed for specific wallet types)
  ChunkName.Ethers,
  ChunkName.Viem,

  // UI libraries (lazy-loaded on specific pages)
  ChunkName.AceEditor,
  ChunkName.Lottie,
  ChunkName.Charts
] as const

/**
 * Check if a chunk should be excluded from modulepreload.
 */
function shouldExcludeFromPreload(chunkPath: string): boolean {
  return EXCLUDED_PRELOAD_CHUNKS.some((excluded) =>
    chunkPath.includes(excluded)
  )
}

/**
 * Nuxt hooks for build optimization.
 *
 * @example
 * // In nuxt.config.ts:
 * import { hooks } from './nuxt-config/hooks'
 * export default defineNuxtConfig({ hooks })
 */
export const hooks = {
  /**
   * Modify the build manifest to exclude heavy chunks from modulepreload.
   * This reduces initial page load by deferring large dependencies until they're actually needed.
   *
   * @see https://nuxt.com/docs/api/nuxt-hooks#build-hooks
   */
  'build:manifest': (manifest: Record<string, any>) => {
    for (const key in manifest) {
      const entry = manifest[key]

      // Filter out excluded chunks from preload (this is what generates <link rel="modulepreload">)
      if (Array.isArray(entry.preload)) {
        entry.preload = entry.preload.filter(
          (chunk: string) => !shouldExcludeFromPreload(chunk)
        )
      }
    }
  }
}
