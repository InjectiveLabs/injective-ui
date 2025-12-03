# Vite `optimizeDeps` Configuration Explained

This document explains why the `optimizeDeps.include` configuration exists in `index.ts` and whether it can be simplified.

## What is `optimizeDeps`?

Vite's `optimizeDeps` is a **development-only** feature that pre-bundles dependencies before loading your site. It serves two main purposes:

1. **CommonJS/UMD to ESM Conversion**: Vite's dev server serves all code as native ESM. Dependencies shipped as CommonJS or UMD must be converted first.

2. **Performance Optimization**: Some packages (like `lodash-es`) have hundreds of internal modules. Without pre-bundling, the browser would fire 600+ HTTP requests simultaneously, causing network congestion. Pre-bundling consolidates these into a single module.

> **Note**: This configuration has no effect on production builds. Production uses Rollup's `@rollup/plugin-commonjs` instead.

## Why This Configuration Exists

When you run `pnpm dev` against a **remote GitHub layer branch** (e.g., `github:InjectiveLabs/injective-ui#feat/protobuf-v2`), Vite faces several challenges:

### 1. Linked/External Packages Aren't in `node_modules`

Vite's automatic dependency discovery crawls your source code looking for "bare imports" (imports from `node_modules`). But when extending from a remote Nuxt layer, many dependencies come from that layer's context, not your local `node_modules`.

### 2. Dynamic Imports Can't Be Statically Analyzed

If a package is imported dynamically or through a plugin transform, Vite can't discover it during the initial scan.

### 3. Late Discovery = Full Page Reloads

When Vite encounters an undiscovered dependency after the server starts, it must re-bundle and trigger a full page reload. This is disruptive during development.

## What `optimizeDeps.include` Does

By explicitly listing packages, you're telling Vite: "Pre-bundle these upfront, don't wait to discover them." This:

- Prevents page reloads when those deps are first used
- Ensures CommonJS packages are properly converted to ESM
- Consolidates packages with many internal modules into single bundles

## Why the List is So Large

The packages fall into several categories:

### Core Wallet/Crypto Packages

These are often CommonJS or have many internal modules:

```typescript
'@injectivelabs/sdk-ts',
'@injectivelabs/wallet-*',
'@cosmjs/*',
'ethers',
```

### UI Libraries with Many Sub-components

```typescript
'apexcharts',
'lottie-web',
'lightweight-charts',
```

### Additional Dependencies for Remote Layer Builds

The `additionalDeps` array specifically addresses the remote layer problem - these are transitive dependencies that wouldn't be discovered when the layer isn't local:

```typescript
const additionalDeps = [
  'bs58', 'bn.js', 'aes-js', 'hash.js', 'js-sha3',
  '@solana/web3.js', '@cosmjs/*', ...
]
```

Note that `isLocalLayer ? [] : additionalDeps` - when developing locally, Vite can analyze the layer's source directly, so fewer explicit includes are needed.

## Is This Configuration Necessary?

**Short answer: Yes, for the current architecture when developing against remote layers.**

### When Entries Could Be Removed

1. **Packages that Vite auto-discovers reliably** - If a package is directly imported in source code (not dynamically), Vite should find it. However, removing it may cause a one-time page reload on first use during dev.

2. **Pure ESM packages with few modules** - Small, modern ESM packages can be served directly without pre-bundling.

3. **Local layer development** - When `LOCAL_LAYER=true`, fewer explicit includes are needed because Vite can analyze the layer's source.

### When Entries Cannot Be Removed

1. **CommonJS packages** - Must be converted to ESM; excluding them would break the dev server.

2. **Packages with hundreds of internal modules** - Would cause severe network congestion without bundling.

3. **Transitive dependencies from remote layers** - Vite can't crawl into the GitHub layer to discover these.

## Potential Alternatives

| Approach                               | Feasibility                     | Trade-offs                                                                                     |
| -------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------- |
| Rely entirely on auto-discovery        | Partially viable                | Causes page reloads during dev. Transitive deps from remote layers would still be problematic. |
| Use `holdUntilCrawlEnd: true`          | Already default in modern Vite  | Helps reduce reloads, but doesn't solve the remote layer issue.                                |
| Publish injective-ui as an npm package | Would solve remote layer issues | Significant workflow change; loses ability to easily test branches.                            |
| Use glob patterns (experimental)       | Partially works                 | `'@injectivelabs/**'` could replace many entries, but doesn't work well for all packages.      |

## Why No Easy Fix Exists

The fundamental issue is **architectural**:

1. Nuxt layer extends from a **remote Git URL** at runtime
2. Vite's dependency discovery happens **locally** before the layer is fully resolved
3. Therefore, transitive dependencies must be **explicitly declared**

This is a known limitation of Vite + remote Nuxt layers. The current solution (explicit `optimizeDeps.include`) is the standard workaround.

## Maintenance Guidelines

### Periodic Auditing

Some packages may have migrated to ESM or been removed from the project. Periodically test dev without certain entries to see if they're auto-discovered.

### Adding New Dependencies

When adding a new dependency that causes issues during development (page reloads, "dependency not found" errors), add it to the appropriate section in `optimizeDeps.include`.

### App-Specific Dependencies

Use the conditional arrays (`IS_HELIX`, `IS_BRIDGE`, etc.) to add packages only where needed, keeping other apps' dev startup times faster.

## References

- [Vite Dependency Pre-Bundling Guide](https://vite.dev/guide/dep-pre-bundling)
- [Vite optimizeDeps Configuration](https://vite.dev/config/dep-optimization-options)
- [Nuxt Layers Documentation](https://nuxt.com/docs/getting-started/layers)
