# Pinia Action Migration Guide

## Overview

This guide helps migrate Pinia store actions that are imported from external files to use `lazyPiniaAction`. This pattern prevents circular dependency errors that occur when action files reference the store they belong to.

## Problem

When a Pinia store imports action functions from separate files, and those files call `useXxxStore()`, a circular dependency is created:

```
store/account/index.ts imports from store/account/message.ts
store/account/message.ts calls useAccountStore()
useAccountStore is defined in store/account/index.ts (not yet initialized)
```

This causes the runtime error:

```
Uncaught (in promise) ReferenceError: Cannot access 'deposit' before initialization
```

## Solution

Use `lazyPiniaAction` to defer the module import until the action is called at runtime.

## Key Principles

1. **Keep external action files** - Do NOT delete the external files (`message.ts`, `stream.ts`, etc.). They are still needed for the lazy import.

2. **Keep using `useXxxStore()` in action files** - The external action functions should continue using `useXxxStore()` to get the store instance. Do NOT change them to use `this`.

3. **Preserve function signatures** - All parameter types and return types should remain exactly the same after migration.

## Migration Steps

### Step 1: Identify Stores to Migrate

Search for Pinia stores that import action functions from other files. Look for this pattern:

```typescript
// store/xxx/index.ts
import { actionA, actionB } from './message'
import { streamX, streamY } from './stream'

export const useXxxStore = defineStore('xxx', {
  actions: {
    actionA, // <-- Imported function assigned directly
    actionB, // <-- Needs migration
    streamX,
    streamY
  }
})
```

### Step 2: Check if Migration is Needed

Migration is required if the imported action file:

1. Calls `useXxxStore()` (the same store it belongs to)
2. Imports from files that call `useXxxStore()`

To verify, check the imported file for store usage:

```typescript
// store/xxx/message.ts
export const actionA = async () => {
  const xxxStore = useXxxStore() // <-- Circular dependency!
  // ...
}
```

### Step 3: Apply Migration

Replace direct action assignments with `lazyPiniaAction`:

```typescript
// BEFORE
import { actionA, actionB } from './message'
import { streamX } from './stream'

export const useXxxStore = defineStore('xxx', {
  actions: {
    actionA,
    actionB,
    streamX
  }
})

// AFTER
export const useXxxStore = defineStore('xxx', {
  actions: {
    actionA: lazyPiniaAction(() => import('./message'), 'actionA'),
    actionB: lazyPiniaAction(() => import('./message'), 'actionB'),
    streamX: lazyPiniaAction(() => import('./stream'), 'streamX')
  }
})
```

### Step 4: Remove Unused Imports

After migration, remove the static imports that are no longer needed:

```typescript
// Remove these imports
import { actionA, actionB } from './message'
import { streamX } from './stream'
```

## Handling Cancel/Cleanup Functions

Cancel functions that are called synchronously within the store (e.g., in `reset()` or `cancelSubaccountStream()` methods) have **two options**:

### Option 1: Keep Direct Imports (Recommended for synchronous cleanup)

If cancel functions are called directly (not through the store), keep the direct imports:

```typescript
// Keep this import - used directly in cancelSubaccountStream()
import {
  cancelSubaccountOrdersStream,
  cancelSubaccountTradesStream
} from './stream'

actions: {
  // Lazy load the stream start functions
  streamOrders: lazyPiniaAction(() => import('./stream'), 'streamOrders'),
  streamTrades: lazyPiniaAction(() => import('./stream'), 'streamTrades'),

  // Cancel functions called directly
  cancelSubaccountStream() {
    cancelSubaccountOrdersStream()  // Direct synchronous call
    cancelSubaccountTradesStream()  // Direct synchronous call
  }
}
```

### Option 2: Convert to Async and Use Store Actions

If you want full lazy loading, convert the method to async and call through the store:

```typescript
// No direct imports needed
actions: {
  // Lazy load everything
  streamOrders: lazyPiniaAction(() => import('./stream'), 'streamOrders'),
  cancelOrdersStream: lazyPiniaAction(() => import('./stream'), 'cancelOrdersStream'),

  // Async cleanup method
  async cancelSubaccountStream() {
    const store = useXxxStore()
    await Promise.all([
      store.cancelOrdersStream(),
      store.cancelTradesStream()
    ])
  }
}
```

**Choose Option 1** when:

- Cleanup must be synchronous
- The cancel functions are simple and don't cause bundle bloat

**Choose Option 2** when:

- You want maximum lazy loading
- The cleanup can be asynchronous
- The stream modules are large

## API Reference

### lazyPiniaAction

```typescript
function lazyPiniaAction<TModule, TKey extends keyof TModule>(
  importFn: () => Promise<TModule>,
  actionName: TKey
): AsyncFunction
```

**Parameters:**

- `importFn`: A function returning a dynamic import promise (e.g., `() => import('./message')`)
- `actionName`: The exported function name to call from the module

**Returns:** An async function that lazily loads the module and calls the action

## Example Migration

### Before (Circular Dependency)

```typescript
// store/account/index.ts
import { deposit, withdraw } from './message'
import { streamBalance } from './stream'

export const useAccountStore = defineStore('account', {
  actions: {
    deposit,
    withdraw,
    streamBalance,

    reset() {
      // ...
    }
  }
})
```

### After (Fixed)

```typescript
// store/account/index.ts
export const useAccountStore = defineStore('account', {
  actions: {
    deposit: lazyPiniaAction(() => import('./message'), 'deposit'),
    withdraw: lazyPiniaAction(() => import('./message'), 'withdraw'),
    streamBalance: lazyPiniaAction(() => import('./stream'), 'streamBalance'),

    reset() {
      // ...
    }
  }
})
```

## Real-World Examples

### Example 1: Wallet Store (injective-ui)

```typescript
// store/wallet/index.ts
export const useSharedWalletStore = defineStore('sharedWallet', {
  actions: {
    // Extension checks - lazy loaded from ./extensions
    checkIsBitGetInstalled: lazyPiniaAction(
      () => import('./extensions'),
      'checkIsBitGetInstalled'
    ),
    checkIsMetamaskInstalled: lazyPiniaAction(
      () => import('./extensions'),
      'checkIsMetamaskInstalled'
    ),

    // Magic wallet - lazy loaded from ./magic
    connectMagic: lazyPiniaAction(() => import('./magic'), 'connectMagic'),

    // Turnkey wallet - lazy loaded from ./turnkey
    submitTurnkeyOTP: lazyPiniaAction(
      () => import('./turnkey'),
      'submitTurnkeyOTP'
    ),

    // Inline actions - no changes needed
    async validate() {
      // ...
    }
  }
})
```

### Example 2: Derivative Store with Streams (injective-helix)

```typescript
// store/derivative/index.ts
export const useDerivativeStore = defineStore('derivative', {
  actions: {
    // Message actions - lazy loaded
    submitDerivativeChase: lazyPiniaAction(
      () => import('./message'),
      'submitDerivativeChase'
    ),
    submitTpSlOrder: lazyPiniaAction(
      () => import('./message'),
      'submitTpSlOrder'
    ),
    cancelDerivativeOrder: lazyPiniaAction(
      () => import('./message'),
      'cancelDerivativeOrder'
    ),

    // Stream actions - lazy loaded
    streamDerivativeTrades: lazyPiniaAction(
      () => import('./stream'),
      'streamDerivativeTrades'
    ),
    streamSubaccountDerivativeOrders: lazyPiniaAction(
      () => import('./stream'),
      'streamSubaccountDerivativeOrders'
    ),

    // Cancel stream actions - also lazy loaded
    cancelDerivativeTradesStream: lazyPiniaAction(
      () => import('./stream'),
      'cancelDerivativeTradesStream'
    ),
    cancelSubaccountDerivativeOrdersStream: lazyPiniaAction(
      () => import('./stream'),
      'cancelSubaccountDerivativeOrdersStream'
    ),

    // Cleanup method - async, calls lazy actions through store
    async cancelSubaccountStream() {
      const derivativeStore = useDerivativeStore()

      await Promise.all([
        derivativeStore.cancelSubaccountDerivativeOrdersStream(),
        derivativeStore.cancelSubaccountDerivativeTradesStream(),
        derivativeStore.cancelSubaccountDerivativeOrderHistoryStream()
      ])
    },

    // Inline actions
    resetOrderbookAndTrades() {
      const derivativeStore = useDerivativeStore()
      derivativeStore.$patch({
        trades: [],
        orderbook: undefined
      })
    }
  }
})
```

### Example 3: Campaign Store with Multiple Modules (injective-helix)

```typescript
// store/campaign/index.ts
export const useCampaignStore = defineStore('campaign', {
  actions: {
    // Message actions
    joinGuild: lazyPiniaAction(() => import('./message'), 'joinGuild'),
    createGuild: lazyPiniaAction(() => import('./message'), 'createGuild'),
    claimReward: lazyPiniaAction(() => import('./message'), 'claimReward'),

    // Guild query actions - from a separate module
    pollGuildDetails: lazyPiniaAction(
      () => import('./guild'),
      'pollGuildDetails'
    ),
    fetchGuildsByTVL: lazyPiniaAction(
      () => import('./guild'),
      'fetchGuildsByTVL'
    ),
    fetchUserGuildInfo: lazyPiniaAction(
      () => import('./guild'),
      'fetchUserGuildInfo'
    ),

    // Inline actions that use external services
    async fetchCampaign({ campaignId }) {
      const indexerGrpcCampaignApi = await getIndexerGrpcCampaignApi()
      // ...
    }
  }
})
```

### External Files Remain Unchanged

The external action files (`message.ts`, `stream.ts`, `guild.ts`, etc.) should NOT be modified. They continue to use `useXxxStore()` to access the store:

```typescript
// store/campaign/message.ts - NO CHANGES NEEDED
export const joinGuild = async (guildId: string) => {
  const campaignStore = useCampaignStore() // Keep using this pattern
  const walletStore = useSharedWalletStore()

  // ... implementation

  campaignStore.$patch({
    userGuildInfo: result
  })
}
```

## Identifying Stores That Need Migration

### Quick Search Commands

Find stores with external action imports:

```bash
# Find stores importing from ./message
rg "from '\./message'" app/store/*/index.ts

# Find stores importing from ./stream
rg "from '\./stream'" app/store/*/index.ts

# Find all external imports in store index files
rg "^import .* from '\.\/" app/store/*/index.ts
```

### Pattern to Look For

A store needs migration if it:

1. Imports action functions from external files
2. Assigns those functions directly to the `actions` object

```typescript
// This pattern needs migration:
import { actionA, actionB } from './message'

export const useXxxStore = defineStore('xxx', {
  actions: {
    actionA, // <-- Imported function assigned directly
    actionB // <-- Needs migration
  }
})
```

### Pattern That Does NOT Need Migration

Stores where all actions are defined inline do NOT need migration:

```typescript
// This is fine - no migration needed:
export const useXxxStore = defineStore('xxx', {
  actions: {
    async actionA() {
      // Implementation inline
    },
    async actionB() {
      // Implementation inline
    }
  }
})
```

### Common Store Patterns Requiring Migration

| Store Type   | Typical External Modules                  | Actions to Convert                             |
| ------------ | ----------------------------------------- | ---------------------------------------------- |
| Account      | `message.ts`, `stream.ts`, `neptune.ts`   | deposit, withdraw, transfer, stream functions  |
| Spot         | `message.ts`, `stream.ts`                 | order submission, order cancellation, streams  |
| Derivative   | `message.ts`, `stream.ts`                 | order submission, TP/SL, streams, chase orders |
| Position     | `message.ts`, `stream.ts`                 | close position, add margin, streams            |
| Swap         | `message.ts`                              | swap execution                                 |
| Campaign     | `message.ts`, `guild.ts`                  | claim rewards, guild operations                |
| GridStrategy | `message.ts`, `stream.ts`                 | create/remove strategies, streams              |
| Wallet       | `magic.ts`, `turnkey.ts`, `extensions.ts` | wallet connection, extension checks            |

### File Structure Indicating Potential Migration

Look for stores with this file structure:

```
store/
  account/
    index.ts      # Main store - check for imports from sibling files
    message.ts    # Action functions (deposit, withdraw, transfer)
    stream.ts     # Stream functions
    neptune.ts    # Feature-specific actions
  wallet/
    index.ts      # Main store
    magic.ts      # Magic wallet actions
    turnkey.ts    # Turnkey wallet actions
    extensions.ts # Extension check actions
  spot/
    index.ts
    message.ts
    stream.ts
  derivative/
    index.ts
    message.ts
    stream.ts
  position/
    index.ts
    message.ts
    stream.ts
  campaign/
    index.ts
    message.ts
    guild.ts      # Guild-specific queries
  gridStrategy/
    index.ts
    message.ts
    stream.ts
  leaderboard/
    index.ts
    pnlLeaderboard.ts  # Leaderboard queries
```

## Migration Checklist

Use this checklist when migrating a store:

- [ ] Identify all external action imports in the store's `index.ts`
- [ ] For each imported action, convert to `lazyPiniaAction`
- [ ] Remove the static imports that are no longer needed
- [ ] Check for cancel/cleanup functions:
  - [ ] If called synchronously in methods like `reset()` or `cancelStream()`, keep direct imports OR
  - [ ] Convert the cleanup method to async and use store actions
- [ ] Verify external action files are NOT modified (they keep using `useXxxStore()`)
- [ ] Test the store actions still work correctly
- [ ] Run TypeScript type checking

## Nuxt Layer Considerations

For projects using Nuxt layers (like `injective-helix` extending `injective-ui`):

- `lazyPiniaAction` is defined in the base layer (`injective-ui/app/utils/pinia.ts`)
- It is auto-imported via Nuxt's auto-import system
- Child layers can use `lazyPiniaAction` without explicit imports
- External module paths should use the layer's alias (e.g., `@/store/xxx/message`)

## Verification

After migration, verify:

1. **No runtime errors**: Start the dev server and navigate to pages using the store
2. **Actions work correctly**: Test that the migrated actions execute properly
3. **TypeScript compiles**: Run `pnpm nuxt typecheck` (ignore pre-existing errors)
4. **Streams work**: If stream actions were migrated, verify real-time updates work
5. **Cleanup works**: Test that cancel/reset methods properly clean up resources

## Common Mistakes to Avoid

1. **Deleting external action files** - Don't delete `message.ts`, `stream.ts`, etc. They're still needed.

2. **Modifying external action files** - Don't change `useXxxStore()` to `this`. Keep them as-is.

3. **Forgetting to remove imports** - After migration, remove the now-unused static imports.

4. **Breaking synchronous cleanup** - If a cancel function must be synchronous, keep the direct import.

5. **Mixing patterns** - Be consistent within a store. Either lazy-load all cancel functions or none.

## Notes

- `lazyPiniaAction` is defined in `app/utils/pinia.ts` and should be auto-imported
- The dynamic import preserves full TypeScript type inference
- Actions remain async (they were likely already async)
- Bundle splitting may improve as modules load on-demand
- **Do NOT delete external action files** - they are required for the lazy import to work
- **Do NOT modify external action files** - keep using `useXxxStore()` pattern for store access
