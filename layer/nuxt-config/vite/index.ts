import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nodePolyfills } from '@bangjelkoski/vite-plugin-node-polyfills'
import type { ViteConfig } from '@nuxt/schema'

const buildSourceMap = process.env.BUILD_SOURCEMAP !== 'false'

export default defineConfig({
  define: {
    'process.env': JSON.stringify({}),
    'process.env.DEBUG': JSON.stringify(process.env.DEBUG)
  },
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
        }
      }
    }
  },

  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  },

  optimizeDeps: {
    exclude: ['fsevents'],
    include: ['@keplr-wallet/unit', '@injectivelabs/sdk-ts']
  }
}) as ViteConfig

export const vitePlugins = [{ src: './nuxt-config/buffer.ts', ssr: false }]
