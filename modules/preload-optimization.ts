import { defineNuxtModule } from '@nuxt/kit'
import { ChunkName } from '../nuxt-config/vite/chunk'

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

  // Large ecosystem dependencies
  ChunkName.CosmJs,

  // Ethereum libraries (only needed for specific wallet types)
  ChunkName.Ethers,
  ChunkName.Viem,

  // UI libraries (lazy-loaded on specific pages)
  ChunkName.AceEditor,
  ChunkName.Lottie,
  ChunkName.Charts
]

/**
 * Check if a chunk should be excluded from modulepreload.
 */
function shouldExcludeFromPreload(chunkPath: string): boolean {
  return EXCLUDED_PRELOAD_CHUNKS.some((excluded) =>
    chunkPath.includes(excluded)
  )
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`

  return `${(bytes / (1024 * 1024)).toFixed(2)}M`
}

/**
 * Print modulepreload chunks from generated HTML files.
 * This helps verify which chunks are being preloaded on initial page load.
 */
async function printModulePreloadChunks(outputDir: string): Promise<void> {
  const fs = await import('node:fs/promises')
  const path = await import('node:path')

  const publicDir = path.join(outputDir, 'public')
  const nuxtDir = path.join(publicDir, '_nuxt')

  try {
    // Read index.html
    const indexPath = path.join(publicDir, 'index.html')
    const html = await fs.readFile(indexPath, 'utf-8')

    // Extract modulepreload hrefs - handle both attribute orders
    const preloadRegex =
      /rel="modulepreload"[^>]*href="(\/_nuxt\/[^"]+)"|href="(\/_nuxt\/[^"]+)"[^>]*rel="modulepreload"/g
    const matches = [...html.matchAll(preloadRegex)]
    const chunks = matches.map((m) => (m[1] || m[2])!.replace('/_nuxt/', ''))

    if (chunks.length === 0) {
      console.log('\n📦 No modulepreload chunks found in index.html\n')

      return
    }

    // Get file sizes
    const chunkInfo: { name: string; size: number }[] = []
    for (const chunk of chunks) {
      try {
        const stat = await fs.stat(path.join(nuxtDir, chunk))
        chunkInfo.push({ name: chunk, size: stat.size })
      } catch {
        chunkInfo.push({ name: chunk, size: 0 })
      }
    }

    // Sort by size descending
    chunkInfo.sort((a, b) => b.size - a.size)

    const totalSize = chunkInfo.reduce((sum, c) => sum + c.size, 0)

    console.log('\n' + '='.repeat(70))
    console.log('📦 MODULEPRELOAD CHUNKS (loaded on initial page load)')
    console.log('='.repeat(70))
    console.log('')

    for (const { name, size } of chunkInfo) {
      const sizeStr = formatBytes(size).padStart(8)
      const isExcluded = shouldExcludeFromPreload(name)
      const warning = isExcluded ? ' ⚠️  SHOULD BE EXCLUDED' : ''
      console.log(`  ${sizeStr}  ${name}${warning}`)
    }

    console.log('')
    console.log('-'.repeat(70))
    console.log(
      `  ${formatBytes(totalSize).padStart(8)}  TOTAL (${chunks.length} chunks)`
    )
    console.log('='.repeat(70))
    console.log('')

    // Print any chunks that should have been excluded but weren't
    const leakedChunks = chunkInfo.filter((c) =>
      shouldExcludeFromPreload(c.name)
    )
    if (leakedChunks.length > 0) {
      const leakedSize = leakedChunks.reduce((sum, c) => sum + c.size, 0)
      console.log(
        '⚠️  WARNING: The following chunks should be excluded from preload:'
      )
      for (const { name, size } of leakedChunks) {
        console.log(`     - ${name} (${formatBytes(size)})`)
      }
      console.log(`   Total wasted preload: ${formatBytes(leakedSize)}`)
      console.log('')
    }
  } catch {
    // Silently ignore if index.html doesn't exist (e.g., during dev)
  }
}

/**
 * Nuxt module for optimizing modulepreload behavior.
 *
 * This module:
 * 1. Filters out large chunks from modulepreload to reduce initial page load
 * 2. Prints a summary of modulepreload chunks after build/generate
 *
 * Being a module ensures these hooks run even if extending apps define their own hooks.
 */
export default defineNuxtModule({
  meta: {
    name: 'shared-preload-optimization',
    configKey: 'preloadOptimization'
  },

  defaults: {
    enabled: true,
    printAnalysis: true
  },

  setup(options, nuxt) {
    if (!options.enabled) {
      return
    }

    // Modify the build manifest to exclude heavy chunks from modulepreload
    // The manifest entry's `preload` property is a boolean that controls
    // whether the chunk is included in modulepreload links in the HTML
    nuxt.hook('build:manifest', (manifest) => {
      for (const key in manifest) {
        const entry = manifest[key] as any

        // Check if this entry's file matches excluded chunks
        if (
          entry?.file &&
          entry.preload === true &&
          shouldExcludeFromPreload(entry.file)
        ) {
          entry.preload = false
        }
      }
    })

    // Print modulepreload analysis after build/generate completes
    if (options.printAnalysis) {
      nuxt.hook('close', async () => {
        // Only run during actual build/generate, not during prepare/typecheck/etc
        const isGenerate = (nuxt.options as any)._generate
        const isBuild = (nuxt.options as any)._build

        if (!isGenerate && !isBuild) {
          return
        }

        const path = await import('node:path')
        const outputDir =
          nuxt.options.nitro?.output?.dir ||
          path.join(nuxt.options.rootDir, '.output')
        await printModulePreloadChunks(outputDir)
      })
    }
  }
})
