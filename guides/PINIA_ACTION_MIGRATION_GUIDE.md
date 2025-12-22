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

## Array Type $patch Optimization

### Quick Decision Tree

```
Is the property being patched an array type?
│
├─ NO → Keep $patch (or use direct assignment for primitives)
│
└─ YES → Is it a single-property $patch?
         │
         ├─ YES → CONVERT to direct assignment
         │        store.$patch({ items }) → store.items = items
         │
         └─ NO → Are other properties derived from the array?
                 │
                 ├─ YES → KEEP $patch (atomicity needed)
                 │        e.g., { orders, ordersCount: orders.length }
                 │
                 └─ NO → CONVERT to separate assignments
                         store.$patch({ arr1, arr2 })
                         → store.arr1 = arr1
                         → store.arr2 = arr2
```

### Problem

When using `$patch` to update array properties in Pinia stores, it's more efficient and readable to use direct assignment instead:

```typescript
// LESS EFFICIENT - creates unnecessary object wrapper
store.$patch({ list: apiResponse })

// MORE EFFICIENT - direct assignment
store.list = apiResponse
```

### Why This Matters

1. **Performance**: Direct assignment avoids creating an extra object and the internal patch processing
2. **Readability**: Clearer intent - you're directly updating a property
3. **Type Safety**: Better TypeScript inference for array operations
4. **Bundle Size**: Slightly smaller code footprint

### When to Apply This Rule

Apply this optimization **only for array types**. For objects and primitive values, `$patch` may still be preferred for multiple updates.

### Migration Examples

#### Example 1: Simple Array Assignment

```typescript
// BEFORE
store.$patch({ items })

// AFTER
store.items = items
```

#### Example 2: Array with Spread Operations

```typescript
// BEFORE
store.$patch({
  items: [...store.items, newItem]
})

// AFTER
store.items = [...store.items, newItem]
```

#### Example 3: Reset Arrays

```typescript
// BEFORE
store.$patch({ items: [] })

// AFTER
store.items = []
```

#### Example 4: Multiple Array Updates

```typescript
// BEFORE - multiple arrays in one patch
store.$patch({
  activeItems: activeItems,
  completedItems: completedItems
})

// AFTER - separate assignments
store.activeItems = activeItems
store.completedItems = completedItems
```

### How to Identify Array $patch Usage

The key to not missing cases is a **systematic two-step approach**:

#### Step 1: Extract All Array Properties from State Definitions

First, identify ALL array properties in your stores by checking state definitions:

```bash
# Find all state definitions with array types
# Look for patterns like: propertyName: [] or propertyName: Type[]
rg "^\s+\w+:\s*\[\]|^\s+\w+:\s*\w+\[\]" app/store/ --type ts -A 0 -B 0
```

Create a list of all array property names from your stores. For example:

- `latestBlocks`, `latestOneHundredBlocks`, `latestTransactions` (network store)
- `validators`, `delegations`, `rewards`, `reDelegations` (staking store)
- `validatorUptime` (explorer store)
- `transactions` (transaction store)
- `pastAuctions`, `accountAuctions`, `pastAuctionsCursors` (auction store)

#### Step 2: Search for $patch Usage of Each Array Property

For each array property identified, search for its usage in `$patch`:

```bash
# Search for specific array property in $patch
# Replace PROPERTY_NAME with actual property names from Step 1
rg "\$patch.*PROPERTY_NAME" app/store/ --type ts -B 2 -A 5

# Examples:
rg "\$patch.*latestBlocks" app/store/ --type ts -B 2 -A 5
rg "\$patch.*validators" app/store/ --type ts -B 2 -A 5
rg "\$patch.*transactions" app/store/ --type ts -B 2 -A 5
```

#### Alternative: Comprehensive Search Script

Use this script to find ALL `$patch` calls and manually review each one:

```bash
# List all $patch usage with context
rg "\$patch" app/store/ --type ts -B 1 -A 8 > patch_usage.txt

# Then review each case and check if the property being patched is an array type
```

#### Checklist Approach

For each store file:

1. **List all array properties** from the state definition
2. **Search for each array property** in `$patch` calls within that file
3. **Evaluate each match**:
   - Single array property → Convert to direct assignment
   - Array + primitive(s) → Convert to separate assignments
   - Array + related derived value (e.g., array + count) → Keep as `$patch`
   - Multiple related arrays → Keep as `$patch`

### Common Array Property Patterns

Array properties in real codebases often follow these naming patterns:

| Pattern                | Examples                                                        | Typical Usage             |
| ---------------------- | --------------------------------------------------------------- | ------------------------- |
| **Plural nouns**       | `validators`, `delegations`, `rewards`, `trades`, `orders`      | Collections of entities   |
| **Prefixed plurals**   | `latestBlocks`, `pastAuctions`, `accountAuctions`               | Scoped collections        |
| **Suffixed with List** | `todoList`, `watchList`                                         | Explicit list types       |
| **Suffixed with s**    | `transactions`, `proposals`, `campaigns`                        | Standard pluralization    |
| **Compound names**     | `unbondingDelegations`, `validatorDelegations`, `reDelegations` | Specific entity types     |
| **Cursor/pagination**  | `pastAuctionsCursors`, `accountAuctionsCursors`                 | Pagination state          |
| **Uptime/metrics**     | `validatorUptime`, `latestOneHundredBlocks`                     | Time-series data          |
| **Owner/user scoped**  | `ownerTokenFactoryMetaTokens`, `userStrategies`                 | User-specific collections |

### Migration Steps

1. **Extract array properties from each store's state definition**:

   ```typescript
   // Example: network store state
   type NetworkStoreState = {
     blockHeight: number // primitive - skip
     latestBlocks: Block[] // ARRAY - check for $patch
     streamedBlockHeight: number // primitive - skip
     latestOneHundredBlocks: Block[] // ARRAY - check for $patch
     latestTransactions: Transaction[] // ARRAY - check for $patch
   }
   ```

2. **Search for $patch usage of each array property**:

   ```bash
   # For each array property, search in the store file
   rg "latestBlocks" app/store/network.ts
   rg "latestOneHundredBlocks" app/store/network.ts
   rg "latestTransactions" app/store/network.ts
   ```

3. **Evaluate each $patch call**:

   ```typescript
   // CONVERT - single array property
   store.$patch({ latestBlocks: blocks })
   // → store.latestBlocks = blocks

   // CONVERT - array + unrelated primitive
   store.$patch({
     latestBlocks: newBlocks,
     streamedBlockHeight: block.height
   })
   // → store.latestBlocks = newBlocks
   // → store.streamedBlockHeight = block.height

   // KEEP - array + derived count (atomicity needed)
   store.$patch({
     orders: newOrders,
     ordersCount: newOrders.length
   })
   ```

4. **Apply the conversion**:

   ```typescript
   // BEFORE
   store.$patch({ validators: validatorList })

   // AFTER
   store.validators = validatorList
   ```

### Exception Cases - When to Keep $patch

**Keep using $patch when:**

1. **Derived/computed values depend on the array** (atomicity required):

   ```typescript
   // KEEP - count is derived from array length
   store.$patch({
     orders: newOrders,
     ordersCount: newOrders.length
   })

   // KEEP - total is computed from array
   store.$patch({
     items: newItems,
     totalValue: newItems.reduce((sum, i) => sum + i.value, 0)
   })
   ```

2. **Conditional updates with function syntax**:

   ```typescript
   // KEEP - conditional patching
   store.$patch((state) => {
     if (shouldReset) {
       state.items = []
     }
     if (hasNewData) {
       state.items = newData
     }
   })
   ```

3. **Complex object updates with nested arrays**:

   ```typescript
   // KEEP - nested object structure
   store.$patch({
     user: {
       ...store.user,
       tags: newTags // array inside object
     }
   })
   ```

**Convert to direct assignment when:**

1. **Single array property**:

   ```typescript
   // CONVERT
   store.$patch({ validators: newValidators })
   // → store.validators = newValidators
   ```

2. **Array + unrelated primitives** (no derived relationship):

   ```typescript
   // CONVERT - these are independent updates
   store.$patch({
     latestBlocks: newBlocks,
     streamedBlockHeight: height
   })
   // → store.latestBlocks = newBlocks
   // → store.streamedBlockHeight = height
   ```

3. **Multiple independent arrays**:

   ```typescript
   // CONVERT - arrays are not derived from each other
   store.$patch({
     pastAuctions: auctions,
     pastAuctionsCursors: cursors
   })
   // → store.pastAuctions = auctions
   // → store.pastAuctionsCursors = cursors
   ```

### Automated Migration Script

For large codebases, use this systematic approach:

```bash
#!/bin/bash
# array_patch_migration.sh - Find all array $patch candidates

echo "=== Step 1: Finding all store state definitions ==="
echo "Look for array types (ending with [] or initialized as [])"
echo ""

# Find all store files
STORE_FILES=$(find app/store -name "*.ts" -type f)

for file in $STORE_FILES; do
  echo "--- $file ---"

  # Extract array property names from state type definitions
  # Matches patterns like: propertyName: Type[] or propertyName: []
  grep -E "^\s+\w+:\s*(\[\]|\w+\[\])" "$file" | sed 's/:.*//' | tr -d ' '

  echo ""
done

echo "=== Step 2: Finding $patch usage for review ==="
rg "\$patch" app/store/ --type ts -B 1 -A 8
```

### Verification Checklist

After migration, use this checklist to ensure nothing was missed:

- [ ] **For each store file**:
  - [ ] Listed all array properties from state definition
  - [ ] Searched for each array property in `$patch` calls
  - [ ] Evaluated each match (convert vs keep)
  - [ ] Applied conversions
  - [ ] Verified no remaining single-array `$patch` calls

- [ ] **Final verification**:
  - [ ] Run `rg "\$patch.*\{.*\}" app/store/` and manually review each result
  - [ ] TypeScript compiles without new errors
  - [ ] Functionality preserved (test the app)
  - [ ] All existing tests pass

### Best Practices

1. **Consistency**: Apply the same pattern across all stores in your codebase
2. **Documentation**: Update team coding standards to prefer direct assignment for arrays
3. **Code reviews**: Add this as a checklist item for PR reviews
4. **Linting**: Consider adding a custom ESLint rule to detect array `$patch` usage

### Real-World Migration Insights

Based on actual migration experience across large codebases, here are common patterns and insights:

#### Common Array-Only Patterns Found

1. **Stream Updates** - Real-time data being prepended/appended:

   ```typescript
   // Stream pattern - new items at front
   store.trades = [newTrade, ...store.trades]

   // Stream pattern - filtered updates
   store.positions = store.positions.filter((p) => p.id !== removedId)

   // Stream pattern - mapped updates
   store.positions = store.positions.map((p) =>
     p.id === updatedId ? updatedPosition : p
   )
   ```

2. **Reset Operations** - Clearing arrays in cleanup:

   ```typescript
   // Reset pattern
   store.strategies = []
   store.orders = []
   store.trades = []
   ```

3. **API Response Assignment** - Direct assignment from API calls:

   ```typescript
   // API pattern
   const { campaigns } = await api.fetchCampaigns()
   store.campaigns = campaigns

   const { strategies } = await api.fetchStrategies()
   store.strategies = strategies
   ```

4. **Array Operations with Spread**:

   ```typescript
   // Append pattern
   store.marketIds = [...store.marketIds, newMarketId]

   // Replace pattern
   store.items = [...filteredItems, newItem]
   ```

#### Patterns to Keep as $patch

1. **Array + Count Updates** - When updating derived data:

   ```typescript
   // Keep this - atomic update of array + count
   store.$patch({
     orders: newOrders,
     ordersCount: newOrders.length
   })
   ```

2. **Multiple Array Updates** - When arrays must update together:

   ```typescript
   // Keep this - related arrays updated atomically
   store.$patch({
     activeItems: activeItems,
     inactiveItems: inactiveItems
   })
   ```

3. **Complex Nested Updates** - Arrays inside objects:
   ```typescript
   // Keep this - nested structure
   store.$patch({
     user: {
       ...store.user,
       permissions: newPermissions // array inside object
     }
   })
   ```

#### Migration Statistics

From a typical large codebase migration:

- **Total $patch usage**: ~120 instances
- **Array-only optimizations**: ~15 instances (12.5%)
- **Files affected**: 8 store files
- **Common locations**: Stream files, API response handlers, reset functions

#### Performance Impact

- **Bundle size**: Small reduction (~0.1%)
- **Runtime performance**: Minor improvement in array updates
- **Type safety**: Better TypeScript inference for array operations
- **Readability**: Significantly improved intent clarity

#### Automation Opportunities

For large-scale migrations, consider these automated approaches:

```bash
# 1. Find candidate patterns
grep -r "\$patch.*{.*}" store/ | grep -v "Count\|Total\|Length"

# 2. Generate sed commands (example)
# This would need customization based on your patterns
```

#### Common Pitfalls to Avoid

1. **Breaking atomicity** - Don't separate related updates:

   ```typescript
   // WRONG - breaks atomicity
   store.orders = newOrders
   store.ordersCount = newOrders.length // Separate update

   // RIGHT - keep as $patch
   store.$patch({
     orders: newOrders,
     ordersCount: newOrders.length
   })
   ```

2. **Missing reactive updates** - Ensure direct assignment maintains reactivity:

   ```typescript
   // This works fine in Pinia 3.x
   store.items = newItems

   // No need for special handling - Pinia handles reactivity
   ```

3. **Complex conditions** - Keep complex conditional logic in $patch:
   ```typescript
   // Keep this - complex conditional logic
   store.$patch((state) => {
     if (condition1) {
       state.items = items1
     } else if (condition2) {
       state.items = items2
     }
   })
   ```

## Notes

- `lazyPiniaAction` is defined in `app/utils/pinia.ts` and should be auto-imported
- The dynamic import preserves full TypeScript type inference
- Actions remain async (they were likely already async)
- Bundle splitting may improve as modules load on-demand
- **Do NOT delete external action files** - they are required for the lazy import to work
- **Do NOT modify external action files** - keep using `useXxxStore()` pattern for store access
