# Vite `optimizeDeps` Configuration Guide

This document explains the `optimizeDeps` configuration in `nuxt-config/vite/index.ts`, why it exists, and how to use it in your app.

## Table of Contents

- [Quick Start (How To)](#quick-start-how-to)
- [Background](#background)
- [Architecture](#architecture)
- [Hybrid Layer Setup (Local + npm)](#hybrid-layer-setup-local--npm)
- [Configuration Reference](#configuration-reference)
- [Troubleshooting](#troubleshooting)
- [Maintenance Guidelines](#maintenance-guidelines)

---

## Quick Start (How To)

### Adding Dependencies to Your App

When you see this in your dev console:

```
ℹ ✨ new dependencies optimized: some-package
ℹ ✨ optimized dependencies changed. reloading
```

It means Vite discovered a dependency at runtime and had to reload. To fix this, add the dependency to your app's `optimizeDeps.include`.

#### Recommended: Using Nuxt Hooks (for proper merging)

Add dependencies via the `vite:extendConfig` hook in your app's hooks file:

```typescript
// your-app/nuxt-config/hook.ts
const isProduction = process.env.NODE_ENV === 'production'

/**
 * App-specific dependencies for Vite optimizeDeps.
 * @see injective-ui/guides/OPTIMIZE_DEPS.md
 */
const APP_OPTIMIZE_DEPS = ['some-package', 'another-package']

export default {
  // ... other hooks

  /**
   * Extend Vite config to add app-specific optimizeDeps.
   * This properly merges with the layer's base config.
   */
  'vite:extendConfig'(config: any) {
    if (isProduction) return

    config.optimizeDeps = config.optimizeDeps || {}
    config.optimizeDeps.include = config.optimizeDeps.include || []
    config.optimizeDeps.include.push(...APP_OPTIMIZE_DEPS)

    // Deduplicate
    config.optimizeDeps.include = [...new Set(config.optimizeDeps.include)]
  }
}
```

#### Alternative: Direct Import (for local layer only)

If you're only using local layer development, you can import the helper directly:

```typescript
// your-app/nuxt.config.ts
import { buildOptimizeDepsInclude } from '../injective-ui/nuxt-config/vite'

export default defineNuxtConfig({
  vite: {
    optimizeDeps: {
      include: buildOptimizeDepsInclude(['some-package', 'another-package'])
    }
  }
})
```

> **Note**: The hook method is preferred because it properly merges configs and works with both local and remote layers.

#### Use glob patterns for packages with subpath exports

If you see multiple subpaths being discovered:

```
new dependencies optimized: my-package/foo, my-package/bar, my-package/baz
```

Use a glob pattern instead of listing each one:

```typescript
buildOptimizeDepsInclude([
  'my-package/**' // Covers all subpath exports
])
```

### Complete Example (Using Hooks)

```typescript
// injective-hub/nuxt-config/hook.ts
const isProduction = process.env.NODE_ENV === 'production'

const HUB_OPTIMIZE_DEPS = [
  'highcharts',
  'ace-builds',
  'vue3-ace-editor',
  'ace-builds/src-noconflict/mode-json',
  'ace-builds/src-noconflict/theme-solarized_dark'
]

export default {
  'vite:extendConfig'(config: any) {
    if (isProduction) return

    config.optimizeDeps = config.optimizeDeps || {}
    config.optimizeDeps.include = config.optimizeDeps.include || []
    config.optimizeDeps.include.push(...HUB_OPTIMIZE_DEPS)
    config.optimizeDeps.include = [...new Set(config.optimizeDeps.include)]
  }
}
```

### When NOT to Add Dependencies

Don't add a dependency if:

1. It's already in the base layer config (check `nuxt-config/vite/index.ts`)
2. It's a pure ESM package that Vite handles automatically
3. You only see "new dependencies optimized" once on first load (cache handles subsequent loads)

### Testing Your Changes

After adding dependencies:

```bash
# Clear cache and test
rm -rf node_modules/.vite .nuxt
pnpm dev:local

# Watch for "reloading" messages - there should be fewer/none
```

### Automated Dependency Discovery

Use the `capture-deps.sh` script to automatically discover which dependencies need to be added:

```bash
# From the injective-ui directory
./scripts/capture-deps.sh ../injective-hub
```

This script will:

1. Clear all Vite caches
2. Start the dev server
3. Hit localhost:3000 multiple times to trigger lazy loading
4. Parse the logs and output any discovered dependencies
5. Show the total number of reloads

**Example output when dependencies are missing:**

```
📦 Dependencies discovered at runtime:

Add these to your optimizeDeps.include:

  '@injectivelabs/sdk-ts/core/accounts',
  '@injectivelabs/sdk-ts/utils',
  'qr-code-styling',

----------------------------------------
💡 Tip: If you see many subpaths from the same package,
   consider using a glob pattern: 'package-name/**'

📊 Total reloads during startup: 2
```

**Example output when config is complete:**

```
✅ No new dependencies discovered - your config is complete!

📊 Total reloads during startup: 0
```

---

## Background

### What is `optimizeDeps`?

Vite's `optimizeDeps` is a **development-only** feature that pre-bundles dependencies before loading your site. It serves two main purposes:

1. **CommonJS/UMD to ESM Conversion**: Vite's dev server serves all code as native ESM. Dependencies shipped as CommonJS or UMD must be converted first.

2. **Performance Optimization**: Some packages have hundreds of internal modules. Without pre-bundling, the browser would fire hundreds of HTTP requests simultaneously. Pre-bundling consolidates these into single modules.

> **Note**: This configuration has no effect on production builds.

### Why Manual Configuration is Needed

When running `pnpm dev` against a **remote GitHub layer** (e.g., `github:InjectiveLabs/injective-ui#feat/protobuf-v2`), Vite faces challenges:

1. **Remote layer dependencies aren't locally discoverable** - Vite's dependency crawler runs locally before the layer is fully resolved
2. **Dynamic imports can't be statically analyzed** - Packages imported dynamically or through plugins aren't discovered
3. **Late discovery = page reloads** - When Vite encounters an undiscovered dependency after startup, it triggers a full page reload

### What Changed in Nuxt 3.12+

The `@antfu/nuxt-better-optimize-deps` module was **merged into Nuxt core** in [PR #27372](https://github.com/nuxt/nuxt/pull/27372). This means:

- Common ESM dependencies (vue, vue-router, @vueuse/\*, etc.) are now **excluded** from pre-bundling by default
- This reduces page reloads caused by shared chunk invalidation
- **You already have this optimization** on Nuxt 4.x

However, this doesn't solve the remote layer problem - we still need to manually include dependencies that Vite can't discover.

---

## Architecture

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    injective-ui (layer)                      │
│                                                              │
│  nuxt-config/vite/index.ts                                  │
│  ├── BASE_OPTIMIZE_DEPS (core deps all apps need)           │
│  ├── REMOTE_LAYER_DEPS (transitive deps for remote builds) │
│  ├── APP_SPECIFIC_DEPS (fallback per-app deps)             │
│  └── buildOptimizeDepsInclude() (exported function)         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ extends
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Your App (e.g., Hub)                    │
│                                                              │
│  nuxt.config.ts                                             │
│  └── vite.optimizeDeps.include:                             │
│        buildOptimizeDepsInclude([                           │
│          'highcharts',        // App-specific               │
│          'qr-code-styling',   // App-specific               │
│        ])                                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### The `buildOptimizeDepsInclude` Function

```typescript
function buildOptimizeDepsInclude(appSpecificDeps: string[] = []): string[]
```

This function:

1. Returns the **base layer dependencies** (SDK, wallet packages, etc.)
2. Adds **remote layer transitive deps** when `LOCAL_LAYER !== 'true'`
3. Merges in your **app-specific dependencies**
4. Deduplicates the final array

### Dependency Categories

| Category              | Description                                       | Example                                        |
| --------------------- | ------------------------------------------------- | ---------------------------------------------- |
| **Base Layer Deps**   | Core packages from injective-ui used by all apps  | `@injectivelabs/sdk-ts/**`, `viem`, `ethers`   |
| **Remote Layer Deps** | Transitive deps needed when extending from GitHub | `bs58`, `@cosmjs/stargate`, `eventemitter3`    |
| **App-Specific Deps** | Dependencies unique to your app                   | `highcharts` (Hub), `@solana/web3.js` (Bridge) |

---

## Hybrid Layer Setup (Local + npm)

The `injective-ui` layer can be configured for a hybrid approach: local file path for development and npm package for production builds.

### Overview

| Environment   | `LOCAL_LAYER`    | Extends from                    | Use case                                    |
| ------------- | ---------------- | ------------------------------- | ------------------------------------------- |
| Local dev     | `true`           | `../injective-ui` (file path)   | Fast iteration, hot reload on layer changes |
| CI/Production | `false` or unset | `@injectivelabs/ui-layer` (npm) | Versioned, cached builds                    |

### How It Works

The layer already uses `LOCAL_LAYER` to conditionally include transitive dependencies:

```typescript
// nuxt-config/vite/index.ts
const isLocalLayer = process.env.LOCAL_LAYER === 'true'

// Remote layer deps only included when not using local layer
...(isLocalLayer ? [] : REMOTE_LAYER_TRANSITIVE_DEPS)
```

### Setting Up Conditional Extends in Your App

Update your app's `nuxt.config.ts` to switch between local and npm:

```typescript
// your-app/nuxt.config.ts
const isLocalLayer = process.env.LOCAL_LAYER === 'true'

export default defineNuxtConfig({
  extends: [
    isLocalLayer
      ? '../injective-ui' // Local path for development
      : '@injectivelabs/ui-layer' // npm package for production/CI
  ]
})
```

### Publishing the Layer to npm

1. **Ensure `package.json` is configured correctly:**

   ```json
   {
     "name": "@injectivelabs/ui-layer",
     "main": "./nuxt.config.ts",
     "exports": {
       ".": "./nuxt.config.ts"
     }
   }
   ```

2. **Add the npm package as a dependency in apps:**

   ```json
   {
     "dependencies": {
       "@injectivelabs/ui-layer": "^0.0.1"
     }
   }
   ```

3. **Set up CI to publish** on version tags or releases.

### Development Workflow

```bash
# Local development (uses file path, hot reload works)
LOCAL_LAYER=true pnpm dev

# Production build (uses npm package)
pnpm build
```

### Trade-offs

| Aspect                      | Local Layer             | npm Package              |
| --------------------------- | ----------------------- | ------------------------ |
| Hot reload on layer changes | Yes                     | No (requires republish)  |
| Version control             | Git branch              | Semver                   |
| CI build speed              | Slower (resolves layer) | Faster (cached from npm) |
| Dependency resolution       | Vite crawls locally     | Pre-resolved             |

### When to Update Dependencies

| When you...                                     | Update...                           |
| ----------------------------------------------- | ----------------------------------- |
| Add/change a dep in `injective-ui/package.json` | `BASE_OPTIMIZE_DEPS` in the layer   |
| Add/change a dep in your app's `package.json`   | Your app's `vite:extendConfig` hook |

The `BASE_OPTIMIZE_DEPS` array only needs updates when the **layer's** `package.json` changes. Dependencies from apps extending the layer (e.g., `injective-hub`) should be added via the app's own config, not the layer.

---

## Configuration Reference

### Glob Pattern Support

Vite supports glob patterns in `optimizeDeps.include` (added in [PR #12414](https://github.com/vitejs/vite/pull/12414)):

```typescript
optimizeDeps: {
  include: [
    '@injectivelabs/sdk-ts/**', // All subpath exports
    'dayjs/locale/*', // All locale files
    '@wormhole-foundation/sdk/**' // Deep imports
  ]
}
```

**When to use globs:**

- Package has multiple subpath exports (check its `package.json` exports field)
- You see multiple subpaths being discovered at runtime

### Key Vite Options

| Option                 | Description                                  |
| ---------------------- | -------------------------------------------- |
| `optimizeDeps.include` | Force pre-bundle these deps (supports globs) |
| `optimizeDeps.exclude` | Never pre-bundle these deps                  |
| `optimizeDeps.entries` | Custom entry points for dependency discovery |
| `optimizeDeps.force`   | Force re-bundling (ignore cache)             |

### Environment Variables

| Variable              | Description                                            |
| --------------------- | ------------------------------------------------------ |
| `LOCAL_LAYER=true`    | Uses local layer path, skips remote transitive deps    |
| `NODE_ENV=production` | Disables all optimizeDeps (not needed for prod builds) |

---

## Troubleshooting

### Problem: Constant page reloads during development

**Symptoms:**

```
ℹ ✨ new dependencies optimized: package-a, package-b
ℹ ✨ optimized dependencies changed. reloading
```

**Solution:**
Add the discovered packages to your app's `optimizeDeps.include`:

```typescript
buildOptimizeDepsInclude(['package-a', 'package-b'])
```

### Problem: "Failed to resolve dependency" warnings

**Symptoms:**

```
WARN  Failed to resolve dependency: some-package, present in client 'optimizeDeps.include'
```

**Cause:** The package is in the include list but not installed in your app.

**Solution:** This is usually fine - it means another app uses this package but yours doesn't. The warning is harmless.

### Problem: Subpath exports causing multiple reloads

**Symptoms:**

```
new dependencies optimized: pkg/a, pkg/b, pkg/c, pkg/d...
```

**Solution:** Use a glob pattern:

```typescript
buildOptimizeDepsInclude([
  'pkg/**' // Instead of listing each subpath
])
```

### Problem: Dev works but production build fails

**Note:** `optimizeDeps` only affects development. If production builds fail, the issue is elsewhere (likely in Rollup/build config).

---

## Maintenance Guidelines

### Adding a New Dependency to Your App

1. Run `pnpm dev:local` with clean cache
2. Watch for "new dependencies optimized" + "reloading" messages
3. Add discovered deps to your `buildOptimizeDepsInclude()` call
4. Test again - reloads should be gone

### Adding a New Dependency to the Layer

If it's a dependency that **all apps** will use:

1. Add it to `BASE_OPTIMIZE_DEPS` in `nuxt-config/vite/index.ts`
2. Use glob pattern if it has subpath exports

### Periodic Audit

Every few months:

1. Remove entries for packages no longer used
2. Check if packages have migrated to pure ESM (may not need pre-bundling)
3. Test dev without certain entries to verify they're still needed

### Creating a New App

When creating a new app that uses `injective-ui`:

1. Start with just `buildOptimizeDepsInclude([])` (base deps only)
2. Run `pnpm dev` and watch for reload messages
3. Add app-specific deps as discovered
4. Document your app's deps in a comment

---

## App-Specific Dependency Reference

Current known app-specific dependencies (for reference):

### Hub

```typescript
;[
  'highcharts',
  'ace-builds',
  'vue3-ace-editor',
  'qr-code-styling',
  'ace-builds/src-noconflict/mode-json',
  'ace-builds/src-noconflict/theme-solarized_dark'
]
```

### Bridge

```typescript
;[
  'axios',
  'js-sha3',
  'js-base64',
  'floating-vue',
  '@solana/web3.js',
  '@ethersproject/bytes',
  '@wormhole-foundation/sdk/**'
]
```

### Helix

```typescript
;[
  'gsap',
  'gsap/ScrollTrigger',
  'gsap/ScrollToPlugin',
  'html-to-image',
  'embla-carousel-vue'
]
```

### Explorer

```typescript
;[
  'v-calendar',
  'vue3-ace-editor',
  'ace-builds/src-noconflict/mode-json',
  'ace-builds/src-noconflict/theme-chrome'
]
```

### Mito

```typescript
;['floating-vue']
```

### Admin UI

```typescript
;['axios', 'js-sha3', '@vuepic/vue-datepicker', '@bangjelkoski/ens-validation']
```

---

## Migration Guide

This section provides step-by-step instructions for migrating apps to use the recommended `vite:extendConfig` hook pattern instead of relying on the deprecated `APP_SPECIFIC_DEPS` fallback in the layer.

### Why Migrate?

The legacy `APP_SPECIFIC_DEPS` approach in `nuxt-config/vite/index.ts`:

1. **Couples app dependencies to the layer** - App-specific deps shouldn't live in the shared layer
2. **Requires layer changes for app updates** - Adding a new dep requires modifying injective-ui
3. **Uses IS\_\* flags** - These environment-based flags are harder to maintain

The recommended hook pattern:

1. **Decouples app from layer** - Each app owns its dependencies
2. **Properly merges configs** - Works with both local and remote layers
3. **Easier maintenance** - Changes are local to each app

### Migration Steps

#### Step 1: Update your hooks file

Add the `vite:extendConfig` hook to your app's hooks file. If you don't have a hooks file, create one.

**Before (no vite:extendConfig hook):**

```typescript
// your-app/nuxt-config/hooks/index.ts
import type { NuxtHooks } from 'nuxt/schema'

export default {
  'pages:resolved'(pages) {
    // existing page routing logic
  },
  'nitro:config'(nitroConfig) {
    // existing nitro config
  }
} as NuxtHooks
```

**After (with vite:extendConfig hook):**

```typescript
// your-app/nuxt-config/hooks/index.ts
import type { NuxtHooks } from 'nuxt/schema'

const isProduction = process.env.NODE_ENV === 'production'

/**
 * App-specific dependencies for Vite optimizeDeps.
 * These are added on top of the base layer dependencies.
 *
 * @see injective-ui/guides/OPTIMIZE_DEPS.md for documentation
 */
const APP_OPTIMIZE_DEPS = [
  // Add your app-specific deps here
  // Check APP_SPECIFIC_DEPS in injective-ui/nuxt-config/vite/index.ts
  // for your current deps, or run pnpm dev and watch for reloads
]

export default {
  'pages:resolved'(pages) {
    // existing page routing logic
  },

  'nitro:config'(nitroConfig) {
    // existing nitro config
  },

  /**
   * Extend Vite config to add app-specific optimizeDeps.
   * This properly merges with the layer's base config instead of replacing it.
   */
  'vite:extendConfig'(config: any) {
    if (isProduction) {
      return
    }

    // Ensure optimizeDeps.include exists
    config.optimizeDeps = config.optimizeDeps || {}
    config.optimizeDeps.include = config.optimizeDeps.include || []

    // Add app-specific deps
    config.optimizeDeps.include.push(...APP_OPTIMIZE_DEPS)

    // Deduplicate
    config.optimizeDeps.include = [...new Set(config.optimizeDeps.include)]
  }
} as NuxtHooks
```

#### Step 2: Populate your APP_OPTIMIZE_DEPS

Find your app's dependencies in `injective-ui/nuxt-config/vite/index.ts` under `APP_SPECIFIC_DEPS`:

| App      | Key in APP_SPECIFIC_DEPS |
| -------- | ------------------------ |
| Hub      | `hub`                    |
| Helix    | `helix`                  |
| Bridge   | `bridge`                 |
| Explorer | `explorer`               |
| Mito     | `mito`                   |
| Admin UI | `adminUi`                |

Copy those dependencies to your `APP_OPTIMIZE_DEPS` array.

#### Step 3: Test the migration

```bash
# Clear caches
rm -rf node_modules/.vite .nuxt

# Test with local layer
LOCAL_LAYER=true pnpm dev

# Watch for reload messages - there should be none
# If you see reloads, add those deps to APP_OPTIMIZE_DEPS
```

#### Step 4: (Optional) Remove from layer

Once all apps are migrated, the `APP_SPECIFIC_DEPS` and `getLegacyAppSpecificDeps()` can be removed from the layer.

### Helix Migration Example

Here's a complete example for migrating the Helix app:

**File: `injective-helix/nuxt-config/hooks/index.ts`**

```typescript
import { TradePage, TradeSubPage } from '../../app/types/page'
import {
  verifiedSpotMarketIdMap,
  verifiedDerivateMarketIdMap
} from '../../app/app/json'
import type { NitroConfig } from 'nitropack'
import type { NuxtHooks } from 'nuxt/schema'

const isProduction = process.env.NODE_ENV === 'production'

/**
 * Helix-specific dependencies for Vite optimizeDeps.
 * These are added on top of the base layer dependencies.
 *
 * @see injective-ui/guides/OPTIMIZE_DEPS.md for documentation
 */
const HELIX_OPTIMIZE_DEPS = [
  'gsap',
  'gsap/ScrollTrigger',
  'gsap/ScrollToPlugin',
  'html-to-image',
  'embla-carousel-vue'
]

export default {
  'pages:resolved'(pages) {
    const spotPage = pages.find((page) => page.name === TradePage.Spot)
    const futuresPage = pages.find((page) => page.name === TradePage.Futures)

    if (futuresPage) {
      pages.push({
        ...futuresPage,
        path: '/futures/stocks',
        name: TradeSubPage.Stocks
      })

      pages.push({
        ...futuresPage,
        path: '/futures/:slug()',
        name: TradeSubPage.Futures
      })
    }

    if (spotPage) {
      pages.push({
        ...spotPage,
        path: '/spot/:slug()',
        name: TradeSubPage.Spot
      })
    }
  },

  'nitro:config'(nitroConfig: NitroConfig) {
    if (
      nitroConfig.dev ||
      !nitroConfig.prerender ||
      !nitroConfig.prerender.routes
    ) {
      return
    }

    nitroConfig.prerender.routes = [
      ...nitroConfig.prerender.routes,
      ...Object.keys(verifiedSpotMarketIdMap).map((s) => `/spot/${s}`),
      ...Object.keys(verifiedDerivateMarketIdMap).map((s) => `/futures/${s}`)
    ]
  },

  /**
   * Extend Vite config to add Helix-specific optimizeDeps.
   * This properly merges with the layer's base config instead of replacing it.
   */
  'vite:extendConfig'(config: any) {
    if (isProduction) {
      return
    }

    // Ensure optimizeDeps.include exists
    config.optimizeDeps = config.optimizeDeps || {}
    config.optimizeDeps.include = config.optimizeDeps.include || []

    // Add Helix-specific deps
    config.optimizeDeps.include.push(...HELIX_OPTIMIZE_DEPS)

    // Deduplicate
    config.optimizeDeps.include = [...new Set(config.optimizeDeps.include)]
  }
} as NuxtHooks
```

### Migration Checklist

- [ ] Added `vite:extendConfig` hook to your app's hooks file
- [ ] Copied app-specific deps from layer's `APP_SPECIFIC_DEPS`
- [ ] Tested with `LOCAL_LAYER=true pnpm dev` (no reloads)
- [ ] Tested with remote layer `pnpm dev` (no reloads)
- [ ] Ran `./scripts/capture-deps.sh` to verify no missing deps

---

## References

- [Vite Dependency Pre-Bundling Guide](https://vite.dev/guide/dep-pre-bundling)
- [Vite optimizeDeps Configuration](https://vite.dev/config/dep-optimization-options)
- [Nuxt Layers Documentation](https://nuxt.com/docs/getting-started/layers)
- [Nuxt PR #27372 - ESM deps optimization](https://github.com/nuxt/nuxt/pull/27372)
- [Vite PR #12414 - Glob pattern support](https://github.com/vitejs/vite/pull/12414)
