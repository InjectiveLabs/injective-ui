# CosmJS Bundle Optimisation Guide

## Overview

This guide describes how to lazy-load `@injectivelabs/wallet-cosmos` imports to remove `@cosmjs` packages from the initial bundle, improving initial page load performance.

### Problem

The `@cosmjs` packages are included in the initial bundle due to static imports from `@injectivelabs/wallet-cosmos`. These packages are only needed when:

- Checking if cosmos wallets (Keplr, Leap, etc.) are installed
- Confirming cosmos wallet addresses after connection

### Solution

Convert static imports to dynamic imports, deferring the load until the functionality is actually needed (e.g., when wallet modal opens).

### Impact

| Repo                   | Changes Required            | Breaking Changes |
| ---------------------- | --------------------------- | ---------------- |
| **injective-ui**       | 4 files                     | None             |
| **injective-hub**      | 0 files                     | None             |
| **injective-helix**    | 1 file (separate migration) | None             |
| **injective-explorer** | 0 files                     | None             |
| **mito-ui**            | 0 files                     | None             |
| **injective-bridge**   | Not applicable\*            | N/A              |

\* injective-bridge uses `CosmosWallet` and `CosmosWalletStrategy` for core bridging functionality and should not be lazy-loaded.

---

## Background

### Import Chain Causing the Issue

```
app/composables/useSharedWalletOptions.ts
  └── import { isCosmosWalletInstalled } from '@injectivelabs/wallet-cosmos'
        └── @injectivelabs/wallet-cosmos
              └── @cosmjs/proto-signing
                    └── All @cosmjs/* packages

app/wallet/cosmos.ts
  └── import { confirmCosmosAddress } from '@injectivelabs/wallet-cosmos'
        └── (same chain)
```

Since `useSharedWalletOptions` is used in the wallet modal and `wallet/cosmos.ts` is exported via `WalletService`, the entire `@cosmjs` dependency tree gets bundled.

---

## Migration Steps

### Step 1: Update `app/wallet/cosmos.ts`

Convert `confirmCosmosAddress` to a dynamic import.

**Before:**

```typescript
import { CHAIN_ID } from '../utils/constant'
import { walletStrategy } from './wallet-strategy'
import { confirmCosmosAddress } from '@injectivelabs/wallet-cosmos'
import {
  ErrorType,
  UnspecifiedErrorCode,
  CosmosWalletException
} from '@injectivelabs/exceptions'
import type { Wallet } from '@injectivelabs/wallet-base'

export const confirmCosmosWalletAddress = async (
  wallet: Wallet,
  injectiveAddress: string
) => await confirmCosmosAddress({ wallet, injectiveAddress, chainId: CHAIN_ID })
```

**After:**

```typescript
import { CHAIN_ID } from '../utils/constant'
import { walletStrategy } from './wallet-strategy'
import {
  ErrorType,
  UnspecifiedErrorCode,
  CosmosWalletException
} from '@injectivelabs/exceptions'
import type { Wallet } from '@injectivelabs/wallet-base'

export const confirmCosmosWalletAddress = async (
  wallet: Wallet,
  injectiveAddress: string
) => {
  const { confirmCosmosAddress } = await import('@injectivelabs/wallet-cosmos')

  return confirmCosmosAddress({ wallet, injectiveAddress, chainId: CHAIN_ID })
}
```

**Impact:** None - function signature unchanged, already async.

---

### Step 2: Update `app/store/wallet/index.ts`

Add state properties for cosmos wallet installation status and lazy actions.

#### 2.1 Add State Properties

Add to `WalletStoreState` type:

```typescript
type WalletStoreState = {
  // ... existing properties
  keplrInstalled: boolean
  leapInstalled: boolean
  ninjiInstalled: boolean
  owalletInstalled: boolean
}
```

#### 2.2 Update Initial State Factory

Add to `initialStateFactory`:

```typescript
const initialStateFactory = (): WalletStoreState => ({
  // ... existing properties
  keplrInstalled: false,
  leapInstalled: false,
  ninjiInstalled: false,
  owalletInstalled: false
})
```

#### 2.3 Add Lazy Actions

Add lazy actions following the existing pattern for EVM wallets:

```typescript
actions: {
  // ... existing lazy-loaded extension checks
  checkIsBitGetInstalled: lazyPiniaAction(
    () => import('./extensions'),
    'checkIsBitGetInstalled'
  ),
  // ... other EVM checks

  // Add cosmos wallet checks
  checkIsKeplrInstalled: lazyPiniaAction(
    () => import('./extensions'),
    'checkIsKeplrInstalled'
  ),
  checkIsLeapInstalled: lazyPiniaAction(
    () => import('./extensions'),
    'checkIsLeapInstalled'
  ),
  checkIsNinjiInstalled: lazyPiniaAction(
    () => import('./extensions'),
    'checkIsNinjiInstalled'
  ),
  checkIsOwalletInstalled: lazyPiniaAction(
    () => import('./extensions'),
    'checkIsOwalletInstalled'
  ),

  // ... rest of actions
}
```

---

### Step 3: Update `app/store/wallet/extensions.ts`

Add functions to check cosmos wallet installation status.

**Add the following functions:**

```typescript
import { Wallet } from '@injectivelabs/wallet-base'

// ... existing EVM wallet check functions

export async function checkIsKeplrInstalled() {
  const walletStore = useSharedWalletStore()
  const { isCosmosWalletInstalled } =
    await import('@injectivelabs/wallet-cosmos')

  walletStore.$patch({
    keplrInstalled: isCosmosWalletInstalled(Wallet.Keplr)
  })
}

export async function checkIsLeapInstalled() {
  const walletStore = useSharedWalletStore()
  const { isCosmosWalletInstalled } =
    await import('@injectivelabs/wallet-cosmos')

  walletStore.$patch({
    leapInstalled: isCosmosWalletInstalled(Wallet.Leap)
  })
}

export async function checkIsNinjiInstalled() {
  const walletStore = useSharedWalletStore()
  const { isCosmosWalletInstalled } =
    await import('@injectivelabs/wallet-cosmos')

  walletStore.$patch({
    ninjiInstalled: isCosmosWalletInstalled(Wallet.Ninji)
  })
}

export async function checkIsOwalletInstalled() {
  const walletStore = useSharedWalletStore()
  const { isCosmosWalletInstalled } =
    await import('@injectivelabs/wallet-cosmos')

  walletStore.$patch({
    owalletInstalled: isCosmosWalletInstalled(Wallet.OWallet)
  })
}
```

**Note:** The `Wallet` import from `@injectivelabs/wallet-base` is already used in this file for EVM wallet checks.

---

### Step 4: Update `app/composables/useSharedWalletOptions.ts`

Remove the static import and use store state instead.

**Before:**

```typescript
import { Wallet } from '@injectivelabs/wallet-base'
import { IS_HELIX, IS_DEVNET, IS_MAINNET } from '../utils/constant'
import { isCosmosWalletInstalled } from '@injectivelabs/wallet-cosmos'
import type { SharedWalletOption } from '../types'

export function useSharedWalletOptions() {
  const sharedWalletStore = useSharedWalletStore()

  const popularOptions = computed(() => [
    {
      wallet: Wallet.Metamask,
      downloadLink: !sharedWalletStore.metamaskInstalled
        ? 'https://metamask.io/download'
        : undefined
    },
    {
      wallet: Wallet.Keplr,
      downloadLink: !isCosmosWalletInstalled(Wallet.Keplr)
        ? 'https://www.keplr.app/download'
        : undefined
    }
    // ...
  ])

  const options = computed(() => [
    // ...
    {
      wallet: Wallet.Leap,
      downloadLink: !isCosmosWalletInstalled(Wallet.Leap)
        ? 'https://www.leapwallet.io/downloads'
        : undefined
    }
    // ...
  ])

  async function validateWalletExtensionInstalled() {
    await Promise.all([
      sharedWalletStore.checkIsBitGetInstalled(),
      sharedWalletStore.checkIsRainbowInstalled(),
      sharedWalletStore.checkIsMetamaskInstalled(),
      sharedWalletStore.checkIsOkxWalletInstalled(),
      sharedWalletStore.checkIsRabbyWalletInstalled(),
      sharedWalletStore.checkIsTrustWalletInstalled(),
      sharedWalletStore.checkIsPhantomWalletInstalled()
    ])
  }

  return {
    options,
    popularOptions,
    validateWalletExtensionInstalled
  }
}
```

**After:**

```typescript
import { Wallet } from '@injectivelabs/wallet-base'
import { IS_HELIX, IS_DEVNET, IS_MAINNET } from '../utils/constant'
import type { SharedWalletOption } from '../types'

export function useSharedWalletOptions() {
  const sharedWalletStore = useSharedWalletStore()

  const popularOptions = computed(() => [
    {
      wallet: Wallet.Metamask,
      downloadLink: !sharedWalletStore.metamaskInstalled
        ? 'https://metamask.io/download'
        : undefined
    },
    {
      wallet: Wallet.Keplr,
      downloadLink: !sharedWalletStore.keplrInstalled
        ? 'https://www.keplr.app/download'
        : undefined
    }
    // ...
  ])

  const options = computed(() => [
    // ...
    {
      wallet: Wallet.Leap,
      downloadLink: !sharedWalletStore.leapInstalled
        ? 'https://www.leapwallet.io/downloads'
        : undefined
    }
    // ...
  ])

  async function validateWalletExtensionInstalled() {
    await Promise.all([
      // Existing EVM wallet checks
      sharedWalletStore.checkIsBitGetInstalled(),
      sharedWalletStore.checkIsRainbowInstalled(),
      sharedWalletStore.checkIsMetamaskInstalled(),
      sharedWalletStore.checkIsOkxWalletInstalled(),
      sharedWalletStore.checkIsRabbyWalletInstalled(),
      sharedWalletStore.checkIsTrustWalletInstalled(),
      sharedWalletStore.checkIsPhantomWalletInstalled(),
      // New cosmos wallet checks
      sharedWalletStore.checkIsKeplrInstalled(),
      sharedWalletStore.checkIsLeapInstalled()
    ])
  }

  return {
    options,
    popularOptions,
    validateWalletExtensionInstalled
  }
}
```

**Key Changes:**

1. Removed `import { isCosmosWalletInstalled } from '@injectivelabs/wallet-cosmos'`
2. Changed `!isCosmosWalletInstalled(Wallet.Keplr)` to `!sharedWalletStore.keplrInstalled`
3. Changed `!isCosmosWalletInstalled(Wallet.Leap)` to `!sharedWalletStore.leapInstalled`
4. Added `checkIsKeplrInstalled()` and `checkIsLeapInstalled()` to `validateWalletExtensionInstalled()`

---

## Consumer App Migration

### injective-hub

**No changes required.** The hub does not directly import from `@injectivelabs/wallet-cosmos`. It uses:

- `@shared/WalletService` for wallet operations
- `useSharedWalletStore()` for wallet state
- `isCosmosWallet` from `@injectivelabs/wallet-base` (not `wallet-cosmos`)

### injective-helix (Separate Migration)

The helix app has one direct import that needs updating:

**File:** `app/components/Modals/BankTransfer/Form/Index.vue`

```typescript
// Before
import { isCosmosWalletInstalled } from '@injectivelabs/wallet-cosmos'

const walletOptions = computed(() => [
  {
    wallet: Wallet.Keplr,
    downloadLink: !isCosmosWalletInstalled(Wallet.Keplr)
      ? 'https://www.keplr.app/download'
      : undefined
  }
  // ...
])

// After
const walletOptions = computed(() => [
  {
    wallet: Wallet.Keplr,
    downloadLink: !sharedWalletStore.keplrInstalled
      ? 'https://www.keplr.app/download'
      : undefined
  }
  // ...
])
```

**Note:** Ensure `validateWalletExtensionInstalled()` is called before the modal is shown to populate the store state.

---

## Special Cases

### injective-bridge

The bridge app uses `CosmosWallet` and `CosmosWalletStrategy` from `@injectivelabs/wallet-cosmos` for core cross-chain bridging functionality:

- `app/utils/skip.ts` - Skip protocol integration
- `app/services/wormhole/signers/injective.ts` - Wormhole signer
- `store/bridge/message/cosmos.ts` - Cosmos message broadcasting

**Recommendation:** Do not lazy-load these imports. The bridge app's primary purpose requires these dependencies, and lazy-loading would add unnecessary complexity without meaningful performance benefit.

---

## Verification

### Check Bundle Contents

After migration, verify `@cosmjs` is no longer in the initial bundle:

```bash
# Build the app
pnpm build

# Check for cosmjs in the initial chunks
ls -la .output/public/_nuxt/ | grep cosmjs

# The cosmjs chunk should only be loaded when wallet modal opens
```

### Testing Checklist

- [ ] App loads without errors
- [ ] Wallet modal opens correctly
- [ ] Keplr wallet shows correct install/connect state
- [ ] Leap wallet shows correct install/connect state
- [ ] Cosmos wallet connection works
- [ ] Address confirmation works after connection
- [ ] No console errors related to wallet-cosmos

---

## Summary of Changes

| File                                        | Change                                                                                                            |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `app/wallet/cosmos.ts`                      | Dynamic import for `confirmCosmosAddress`                                                                         |
| `app/store/wallet/index.ts`                 | Add `keplrInstalled`, `leapInstalled`, `ninjiInstalled`, `owalletInstalled` state + lazy actions                  |
| `app/store/wallet/extensions.ts`            | Add `checkIsKeplrInstalled`, `checkIsLeapInstalled`, `checkIsNinjiInstalled`, `checkIsOwalletInstalled` functions |
| `app/composables/useSharedWalletOptions.ts` | Remove static import, use store state, add cosmos checks to `validateWalletExtensionInstalled`                    |

**Total:** ~50 lines changed across 4 files in injective-ui layer.
