# Migration Guide

## Remove Buffer Usage

Replace Node.js `Buffer` usage with helper functions from `@injectivelabs/sdk-ts/utils`.

### Find affected files

```bash
rg "Buffer\.(from|alloc|concat)" --type ts --type vue
```

### Available helper functions

Import from `@injectivelabs/sdk-ts/utils`:

```typescript
import {
  // Hex conversions
  hexToUint8Array, // hex string -> Uint8Array
  uint8ArrayToHex, // Uint8Array -> hex string (no 0x prefix)
  hexToBuff, // hex string -> Uint8Array (handles 0x prefix)

  // Base64 conversions
  base64ToUint8Array, // base64 string -> Uint8Array
  uint8ArrayToBase64, // Uint8Array -> base64 string
  hexToBase64, // hex string -> base64 string
  base64ToUtf8, // base64 string -> UTF-8 string

  // String/UTF-8 conversions
  stringToUint8Array, // string -> Uint8Array (UTF-8)
  uint8ArrayToString, // Uint8Array -> string (UTF-8)
  fromUtf8, // string | Uint8Array -> Uint8Array
  toUtf8, // Uint8Array | string -> string

  // JSON conversions
  toBase64, // object -> base64 string
  fromBase64, // base64 string -> object

  // Array operations
  concatUint8Arrays, // Uint8Array[] -> Uint8Array (replaces Buffer.concat)

  // Binary helpers
  binaryToBase64 // string | Uint8Array -> base64 string
} from '@injectivelabs/sdk-ts/utils'
```

### Common migration patterns

**Buffer.from with base64:**

```typescript
// Before
Buffer.from(data, 'base64').toString('utf-8')

// After
import { base64ToUtf8 } from '@injectivelabs/sdk-ts/utils'
base64ToUtf8(data)
```

**Buffer.from with hex:**

```typescript
// Before
Buffer.from(hexString, 'hex')

// After
import { hexToUint8Array } from '@injectivelabs/sdk-ts/utils'
hexToUint8Array(hexString)
```

**Buffer.from with UTF-8:**

```typescript
// Before
Buffer.from(str, 'utf-8')

// After
import { stringToUint8Array } from '@injectivelabs/sdk-ts/utils'
stringToUint8Array(str)
```

**Buffer.concat:**

```typescript
// Before
Buffer.concat([buf1, buf2, buf3])

// After
import { concatUint8Arrays } from '@injectivelabs/sdk-ts/utils'
concatUint8Arrays([arr1, arr2, arr3])
```

**Buffer.toString:**

```typescript
// Before
buffer.toString('hex')
buffer.toString('base64')
buffer.toString('utf-8')

// After
import {
  uint8ArrayToHex,
  uint8ArrayToBase64,
  toUtf8
} from '@injectivelabs/sdk-ts/utils'
uint8ArrayToHex(arr)
uint8ArrayToBase64(arr)
toUtf8(arr)
```

### Checklist

- [ ] Search for `Buffer.` usage: `rg "Buffer\." --type ts --type vue`
- [ ] Replace each Buffer operation with the appropriate helper
- [ ] Remove `buffer` polyfill from package.json if present
- [ ] Remove `buffer: true` from nuxt.config browser settings if present
- [ ] Run `pnpm typecheck` to verify

---

## Remove alchemy-sdk

Replace `alchemy-sdk` dependency with viem helpers from `@injectivelabs/wallet-base`.

### Find affected files

```bash
rg "alchemy-sdk|Alchemy|AlchemyProvider" --type ts --type vue
```

### Available helper functions

Import from `@injectivelabs/wallet-base`:

```typescript
import {
  getEvmChainConfig, // Get chain config by chainId
  getViemPublicClient, // Create public client with optional RPC URL
  getViemWalletClient, // Create wallet client
  getViemPublicClientFromEip1193Provider // Create client from browser provider
} from '@injectivelabs/wallet-base'
```

### Common migration patterns

**Creating a public client:**

```typescript
// Before
import { Alchemy, Network } from 'alchemy-sdk'
const alchemy = new Alchemy({ apiKey: 'xxx', network: Network.ETH_MAINNET })

// After
import { getViemPublicClient } from '@injectivelabs/wallet-base'
import { EvmChainId } from '@injectivelabs/ts-types'
const client = getViemPublicClient(
  EvmChainId.Mainnet,
  'https://eth-mainnet.g.alchemy.com/v2/xxx'
)
```

**Getting block number:**

```typescript
// Before
const blockNumber = await alchemy.core.getBlockNumber()

// After
const blockNumber = await client.getBlockNumber()
```

**Getting balance:**

```typescript
// Before
const balance = await alchemy.core.getBalance(address)

// After
const balance = await client.getBalance({ address })
```

**Getting transaction:**

```typescript
// Before
const tx = await alchemy.core.getTransaction(hash)

// After
const tx = await client.getTransaction({ hash })
```

**Getting transaction receipt:**

```typescript
// Before
const receipt = await alchemy.core.getTransactionReceipt(hash)

// After
const receipt = await client.getTransactionReceipt({ hash })
```

**Creating wallet client for signing:**

```typescript
// Before
// (alchemy-sdk doesn't handle signing, but if you had a custom setup)

// After
import { getViemWalletClient } from '@injectivelabs/wallet-base'
const walletClient = getViemWalletClient({
  chainId: EvmChainId.Mainnet,
  account: privateKeyToAccount(privateKey),
  rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/xxx'
})
```

**Using browser wallet provider:**

```typescript
// After
import { getViemPublicClientFromEip1193Provider } from '@injectivelabs/wallet-base'
const client = getViemPublicClientFromEip1193Provider(chainId, window.ethereum)
```

### Checklist

- [ ] Search for alchemy usage: `rg "alchemy-sdk|Alchemy" --type ts`
- [ ] Replace Alchemy client creation with `getViemPublicClient`
- [ ] Update all method calls to use viem's API
- [ ] Remove `alchemy-sdk` from package.json
- [ ] Run `pnpm typecheck` to verify

---

## Package.json Dependency Update (December 2024)

This section documents the process for updating and reorganizing dependencies across Injective frontend repositories.

### Overview

Run `pnpm outdated | grep -v "@injectivelabs"` to identify outdated packages (ignore `@injectivelabs/*` as they are managed separately via `postinstall`).

### Dependency Categorization

**Move to `devDependencies`:**

- `@types/*` - Type definitions are dev-only
- `simple-git` - Used in build scripts only

**Move to `dependencies`:**

- `@nuxtjs/robots` - Runtime SEO module
- `@nuxtjs/sitemap` - Runtime SEO module
- `nuxt-clarity-analytics` - Runtime analytics module

**Remove (deprecated):**

- `@nuxtjs/dotenv` - Nuxt 3+ has built-in `.env` support
- `@nuxtjs/pwa` - Only works with Nuxt 2
- `@nuxt/typescript-build` - Nuxt 3+ has built-in TypeScript
- `@nuxtjs/eslint-config-typescript` - Replaced by `@nuxt/eslint`
- `core-js` - Not needed with modern bundlers

### Package Updates

**Safe minor/patch updates:**

```json
{
  "@nuxt/kit": "4.2.1",
  "@nuxt/ui": "4.2.1",
  "nuxt": "4.2.1",
  "axios": "1.13.2",
  "mixpanel-browser": "2.72.0",
  "simple-git": "3.30.0",
  "@nuxt/eslint": "1.11.0",
  "@nuxt/test-utils": "3.21.0",
  "eslint": "9.39.1",
  "eslint-plugin-perfectionist": "4.15.1",
  "prettier": "3.7.4",
  "stylelint": "16.26.1",
  "stylelint-config-standard": "39.0.1",
  "ts-loader": "9.5.4",
  "typescript": "5.9.3",
  "vue-tsc": "3.1.5",
  "lint-staged": "16.2.7",
  "rollup-plugin-visualizer": "6.0.5"
}
```

**Major updates:**

```json
{
  "@vueuse/integrations": "14.1.0",
  "@vueuse/nuxt": "14.1.0",
  "date-fns": "^4.1.0",
  "date-fns-tz": "^3.2.0",
  "tailwind-merge": "^3.4.0",
  "nuxt-vitalizer": "2.0.0",
  "@commitlint/cli": "20.2.0",
  "@commitlint/config-conventional": "20.2.0"
}
```

### Breaking Changes

**date-fns-tz v3:** Function renaming required.

| Old (v2)         | New (v3)        |
| ---------------- | --------------- |
| `utcToZonedTime` | `toZonedTime`   |
| `zonedTimeToUtc` | `fromZonedTime` |

Find affected files:

```bash
rg "utcToZonedTime|zonedTimeToUtc" --type vue --type ts
```

Update imports and function calls:

```typescript
// Before
import { format, utcToZonedTime } from 'date-fns-tz'
const utcDate = utcToZonedTime(timestamp, 'UTC')

// After
import { format, toZonedTime } from 'date-fns-tz'
const utcDate = toZonedTime(timestamp, 'UTC')
```

**Other breaking changes:**

- `date-fns` v4 - Tree-shaking is default, some locale imports changed
- `tailwind-merge` v3 - Some edge cases in class merging may differ
- `vueuse` v14 - Minor API changes in some composables
- `nuxt-vitalizer` v2 - Configuration format may have changed
- `commitlint` v20 - Requires Node.js 18+

### Checklist

- [ ] Run `pnpm outdated` to identify updates
- [ ] Move `@types/*` to devDependencies
- [ ] Move runtime Nuxt modules to dependencies
- [ ] Remove deprecated packages
- [ ] Apply package updates
- [ ] Fix `utcToZonedTime` -> `toZonedTime`
- [ ] Fix `zonedTimeToUtc` -> `fromZonedTime` (if used)
- [ ] Run `pnpm install && pnpm typecheck && pnpm lint && pnpm build`
- [ ] Test application

---

## Vite optimizeDeps Configuration

Migrate to the `vite:extendConfig` hook pattern for managing app-specific Vite dependencies. This decouples app dependencies from the shared layer and ensures proper config merging.

### Overview

When you see this in your dev console:

```
new dependencies optimized: some-package
optimized dependencies changed. reloading
```

It means Vite discovered a dependency at runtime and had to reload. Fix this by adding the dependency to your app's `optimizeDeps.include` via the `vite:extendConfig` hook.

### Find or create hooks file

Check if your app has a hooks file:

```bash
ls nuxt-config/hook.ts nuxt-config/hooks/index.ts 2>/dev/null
```

### Add vite:extendConfig hook

Add the hook to your app's hooks file (create one if it doesn't exist):

```typescript
// your-app/nuxt-config/hook.ts
const isProduction = process.env.NODE_ENV === 'production'

/**
 * App-specific dependencies for Vite optimizeDeps.
 * These are added on top of the base layer dependencies.
 *
 * @see injective-ui/guides/OPTIMIZE_DEPS.md for documentation
 */
const APP_OPTIMIZE_DEPS = [
  // Add your app-specific deps here
  // Run pnpm dev and watch for "new dependencies optimized" messages
]

export default {
  // ... other hooks (pages:resolved, nitro:config, etc.)

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
}
```

### Register hooks in nuxt.config.ts

Ensure your hooks file is registered:

```typescript
// nuxt.config.ts
import hooks from './nuxt-config/hook'

export default defineNuxtConfig({
  hooks
  // ... rest of config
})
```

### Known app-specific dependencies

Reference for each app's dependencies:

| App      | Dependencies                                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Hub      | `highcharts`, `ace-builds`, `vue3-ace-editor`, `ace-builds/src-noconflict/mode-json`, `ace-builds/src-noconflict/theme-solarized_dark` |
| Helix    | `gsap`, `gsap/ScrollTrigger`, `gsap/ScrollToPlugin`, `html-to-image`, `embla-carousel-vue`                                             |
| Bridge   | `axios`, `js-sha3`, `js-base64`, `floating-vue`, `@solana/web3.js`, `@ethersproject/bytes`, `@wormhole-foundation/sdk/**`              |
| Explorer | `v-calendar`, `vue3-ace-editor`, `ace-builds/src-noconflict/mode-json`, `ace-builds/src-noconflict/theme-chrome`                       |
| Mito     | `floating-vue`                                                                                                                         |
| Admin UI | `axios`, `js-sha3`, `@vuepic/vue-datepicker`, `@bangjelkoski/ens-validation`                                                           |

### Glob patterns for subpath exports

If you see multiple subpaths being discovered:

```
new dependencies optimized: my-package/foo, my-package/bar, my-package/baz
```

Use a glob pattern:

```typescript
const APP_OPTIMIZE_DEPS = [
  'my-package/**' // Covers all subpath exports
]
```

### Testing

```bash
# Clear cache and test
rm -rf node_modules/.vite .nuxt
pnpm dev:local

# Watch for "reloading" messages - there should be none
# If you see reloads, add those deps to APP_OPTIMIZE_DEPS
```

### Checklist

- [ ] Check if hooks file exists, create if needed
- [ ] Add `vite:extendConfig` hook with app-specific deps
- [ ] Register hooks in nuxt.config.ts
- [ ] Test with `rm -rf node_modules/.vite .nuxt && pnpm dev:local`
- [ ] Verify no "optimized dependencies changed. reloading" messages
- [ ] See `injective-ui/guides/OPTIMIZE_DEPS.md` for detailed documentation

---

## ESLint Configuration Migration

This section documents the master ESLint rules for Injective frontend repositories. The `injective-ui` eslint config is the source of truth.

### Overview

All Injective frontend apps should use consistent ESLint rules. The key differences between repos are:

1. **Import path patterns** - `injective-ui` uses relative paths (no `@/` alias), while other repos use `@/` aliases
2. **Ignores** - Each repo may have different ignore patterns based on their structure
3. **Custom rule plugin** - The `noSdkTsBarrel` rule should be included in all repos

### Master Rules (Source of Truth)

These are the canonical ESLint rules. Copy and adapt for your repo:

```typescript
import withNuxt from './.nuxt/eslint.config.mjs'
import perfectionist from 'eslint-plugin-perfectionist'

// Custom rule to prevent barrel imports from @injectivelabs/sdk-ts
const noSdkTsBarrel = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow importing from @injectivelabs/sdk-ts barrel export'
    },
    messages: {
      noBarrel:
        'Do not import from "@injectivelabs/sdk-ts". Use subpath imports like @injectivelabs/sdk-ts/client/indexer, /core/modules, etc.'
    }
  },
  create(context: any) {
    return {
      ImportDeclaration(node: any) {
        if (node.source.value === '@injectivelabs/sdk-ts') {
          // Allow type-only imports (import type { ... } from '@injectivelabs/sdk-ts')
          if (node.importKind === 'type') {
            return
          }

          context.report({ node, messageId: 'noBarrel' })
        }
      }
    }
  }
}

// Sort groups configuration
// NOTE: Customize customGroups based on your repo's import alias support
const sortGroups = {
  groups: [
    [
      'builtin',
      'internal',
      'external',
      'injective',
      'shared',
      'parent',
      'sibling',
      'index',
      'object'
    ],
    ['root', 'unknown'],
    'types',
    'type',
    'internal-type',
    ['parent-type', 'sibling-type', 'index-type']
  ] as string[] | { newlinesBetween: 'always' }[],

  customGroups: {
    value: {
      shared: '^@shared/',
      injective: '^@injectivelabs/',
      // For repos WITH @/ alias support (helix, hub, bridge, explorer, mito):
      types: ['^@/types', '^@/types/*'],
      root: [
        '^@/app/',
        '^@/store/',
        '^@/utils/',
        '^@/plugins/',
        '^@/assets/',
        '^@/components/',
        '^@/layouts/',
        '^@/pages/',
        '^@/public/',
        '^@/server/',
        '^@/stores/'
      ]
      // For repos WITHOUT alias support (injective-ui layer):
      // types: ['^../types', '^../../types/', '^../../../types/'],
      // root: [
      //   '^\\.\\./[^./][^/]*$',        // (../file)
      //   '^(?:\\.\\./){2}[^./][^/]*$', // (../../file)
      //   '^(?:\\.\\./){3}[^./][^/]*$', // (../../../file)
      //   '^\\./\\.\\./[^./][^/]*$',    // (./../file)
      //   '^\\./(?:\\.\\./){2}[^./][^/]*$', // (./../../file)
      //   '^\\./(?:\\.\\./){3}[^./][^/]*$'  // (./../../../file)
      // ]
    }
  }
}

const orderParams = {
  order: 'asc',
  type: 'line-length'
} as const

export default withNuxt(
  {
    // Customize ignores for your repo
    ignores: ['i18n/locales/**']
  },
  {
    plugins: {
      perfectionist,
      'custom-rules': {
        rules: {
          'no-sdk-ts-barrel': noSdkTsBarrel
        }
      }
    },

    rules: {
      // Custom rules
      'custom-rules/no-sdk-ts-barrel': 'error',

      // Require blank line before return statements
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' }
      ],

      // Disabled rules
      'no-console': 'off',
      'vue/no-v-html': 'off',
      'no-unused-vars': 'off',
      'vue/html-self-closing': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-duplicate-enum-values': 'off',

      // Disable import/no-duplicates as it conflicts with separate type imports
      'import/no-duplicates': 'off',

      // Perfectionist rules
      ...perfectionist.configs['recommended-line-length'].rules,

      'perfectionist/sort-enums': ['off', orderParams],
      'perfectionist/sort-objects': ['off', orderParams],
      'perfectionist/sort-modules': ['off', orderParams],
      'perfectionist/sort-exports': ['warn', orderParams],
      'perfectionist/sort-interfaces': ['warn', orderParams],
      'perfectionist/sort-union-types': ['warn', orderParams],
      'perfectionist/sort-object-types': ['warn', orderParams],
      'perfectionist/sort-named-exports': ['warn', orderParams],
      'perfectionist/sort-named-imports': ['warn', orderParams],
      'perfectionist/sort-array-includes': ['warn', orderParams],
      'perfectionist/sort-imports': [
        'warn',
        {
          ...orderParams,
          newlinesBetween: 'never',
          groups: sortGroups.groups,
          customGroups: sortGroups.customGroups
        }
      ]
    }
  },
  // TypeScript-specific rules (only for .ts/.vue files)
  // These rules require TypeScript parsing and will error on .js files
  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      // Enforce type imports on separate lines
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
          disallowTypeAnnotations: false
        }
      ],
      // Disabled: requires type information which causes memory issues
      '@typescript-eslint/consistent-type-exports': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'error'
    }
  }
)
```

### Rules Diff Summary

When migrating from an existing config, ensure these rules match:

| Rule                                          | Required Value           |
| --------------------------------------------- | ------------------------ |
| `custom-rules/no-sdk-ts-barrel`               | `'error'`                |
| `padding-line-between-statements`             | `'error'` (not `'warn'`) |
| `vue/first-attribute-linebreak`               | `'off'`                  |
| `@typescript-eslint/no-dynamic-delete`        | `'off'`                  |
| `@typescript-eslint/no-duplicate-enum-values` | `'off'`                  |
| `@typescript-eslint/consistent-type-exports`  | `'off'`                  |
| `perfectionist/sort-modules`                  | `['off', orderParams]`   |

### Important: TypeScript-Specific Rules

The following rules require TypeScript parsing and **must be in a separate config block** with `files: ['**/*.ts', '**/*.vue']`:

- `@typescript-eslint/consistent-type-imports`
- `@typescript-eslint/consistent-type-exports`
- `@typescript-eslint/no-import-type-side-effects`

If these rules are placed in the main rules block (without a `files` filter), ESLint will error when linting `.js` files (like `.prettierrc.js`, `commitlint.config.js`, etc.) with:

```
Error: You have used a rule which requires type information, but don't have parserOptions set to generate type information for this file.
```

### Repo-Specific Customizations

**Ignores:**

| Repo            | Ignores                                         |
| --------------- | ----------------------------------------------- |
| injective-ui    | `['*.cjs']`                                     |
| injective-helix | `['i18n/locales/**', 'app/assets/js/chart/**']` |
| injective-hub   | `['i18n/locales/**']`                           |

**Import aliases:**

- Repos with `@/` alias: Use the standard `customGroups` with `^@/` patterns
- `injective-ui` layer: Use relative path regex patterns (see commented section in master config)

### Checklist

- [ ] Copy master config to your repo's `eslint.config.ts`
- [ ] Adjust `ignores` for your repo structure
- [ ] Adjust `customGroups` based on alias support
- [ ] Ensure `noSdkTsBarrel` custom rule is included
- [ ] Ensure TypeScript-specific rules are in a separate config block with `files: ['**/*.ts', '**/*.vue']`
- [ ] Run `pnpm lint` to verify no errors
- [ ] Run `pnpm lint --fix` to auto-fix formatting issues
