# SDK Bundle Optimization Plan

This document outlines the exploration findings and planned optimizations for reducing bundle size in the Injective TypeScript SDK packages.

## Table of Contents

1. [Overview](#overview)
2. [Current Architecture](#current-architecture)
3. [Package Locations & Structure](#package-locations--structure)
4. [Optimization Tasks](#optimization-tasks)
5. [Consumer-Side Lazy Loading](#consumer-side-lazy-loading)

---

## Overview

The goal is to reduce the bundle size impact of `@injectivelabs/*` packages, particularly:

- **Remove crypto-js** (~400KB) from `@injectivelabs/sdk-ts` by replacing with `@noble/hashes`
- **Move Wallet enum** from `@injectivelabs/wallet-base` to `@injectivelabs/ts-types` to reduce imports pulling in wallet dependencies
- **Maintain lazy loading pattern** in consumers to defer cosmjs (~2.6MB) until wallet connection

---

## Current Architecture

### Bundle Loading Strategy

```
Consumer App (injective-ui)
├── WalletService.ts              ← Entry point, re-exports WalletServiceLoader
├── wallet/
│   ├── WalletServiceLoader.ts    ← CRITICAL: Lazy loader using dynamic import()
│   ├── index.ts                  ← Barrel that imports heavy deps
│   ├── wallet-strategy.ts        ← Creates WalletStrategy
│   ├── broadcaster.ts            ← Creates MsgBroadcaster (→ cosmjs)
│   └── ...
```

### Why WalletServiceLoader is Essential

The `WalletServiceLoader.ts` pattern **must remain** in consumer apps:

1. **Static imports bundle everything**: `import { msgBroadcaster } from '@shared/wallet'` includes all transitive deps in main bundle
2. **Dynamic import() creates code splits**: The loader uses `import('./index')` to create a separate chunk
3. **SDK optimizations complement this**: They reduce the _size_ of the lazy-loaded chunk but don't eliminate the need for lazy loading

```typescript
// Good - lazy loaded via WalletServiceLoader
import { getMsgBroadcaster } from '@shared/WalletService'
const broadcaster = await getMsgBroadcaster()

// Bad - static loading bundles everything
import { msgBroadcaster } from '@shared/wallet'
```

---

## Package Locations & Structure

### @injectivelabs/ts-types

**Location:** `/Users/leeruianthomas/Public/injective/injective-ts/packages/ts-types/`

| File                  | Contents                                                                                |
| --------------------- | --------------------------------------------------------------------------------------- |
| `src/index.ts`        | Main entry, exports all modules                                                         |
| `src/types.ts`        | `EvmChainId`, `ChainId`, `MsgType`, `MsgStatus`, `EIP712Version`                        |
| `src/cosmos.ts`       | `Coin`, `CosmosChainId`, `TestnetCosmosChainId`, `DevnetCosmosChainId`                  |
| `src/trade.ts`        | `TradeExecutionType`, `TradeExecutionSide`, `TradeDirection`, `OrderState`, `OrderSide` |
| `src/common.ts`       | `StreamOperation`, `PaginationOption`, `Constructable`, `UnwrappedPromise`              |
| `src/aliases.ts`      | Type aliases                                                                            |
| `src/transactions.ts` | Transaction types                                                                       |

**Configuration:**

- `package.json` - Version `1.17.2-alpha.2`, no external dependencies
- `tsdown.config.ts` - Treeshaking enabled

---

### @injectivelabs/wallet-base

**Location:** `/Users/leeruianthomas/Public/injective/injective-ts/packages/wallets/wallet-base/`

**Enums file:** `src/types/enums.ts`

```typescript
// Current contents of enums.ts
export const BroadcastMode = { Block, Sync, Async } as const
export const Wallet = { Leap, Keplr, Ninji, Magic, ... } as const
export const MagicProvider = { Email, Apple, Github, ... } as const
export const WalletDeviceType = { Mobile, Browser, Hardware, ... } as const
export const WalletEventListener = { AccountChange, ChainIdChange } as const
export const WalletAction = { ...WalletErrorActionModule }
```

**Dependencies:**

- `@injectivelabs/exceptions` - For `WalletErrorActionModule` re-export
- `@injectivelabs/sdk-ts` - Used in base.ts and utils
- `@injectivelabs/ts-types` - Already a dependency
- `eip1193-provider`, `viem` - Used in utils

---

### @injectivelabs/sdk-ts (crypto-js usage)

**Location:** `/Users/leeruianthomas/Public/injective/injective-ts/packages/sdk-ts/`

**crypto-js file:** `src/utils/crypto.ts`

**Functions using crypto-js:**

| Function                      | crypto-js Usage                                       |
| ----------------------------- | ----------------------------------------------------- |
| `hashToHex(data: string)`     | `CryptoEs.SHA256`, `CryptoEs.enc.Base64.parse`        |
| `sha256(data: Uint8Array)`    | `CryptoEs.lib.WordArray.create`, `CryptoEs.SHA256`    |
| `ripemd160(data: Uint8Array)` | `CryptoEs.lib.WordArray.create`, `CryptoEs.RIPEMD160` |

**Functions NOT using crypto-js (safe):**

- `privateKeyToPublicKey`, `privateKeyHashToPublicKey` - use `@noble/curves/secp256k1`
- `publicKeyToAddress` - uses `viem` keccak256
- `domainHash`, `messageHash`, `hashStruct` - use `viem` hashTypedData
- `decompressPubKey` - uses `@noble/curves/secp256k1`
- `sanitizeTypedData` - pure JS

**Test file:** `src/utils/crypto.spec.ts`
**Test framework:** Vitest (see `vitest.config.ts` at repo root)

**Existing tests cover:**

- `hashToHex` - with known input/output
- `sha256` - with known input/output
- `ripemd160` - with known input/output
- `privateKeyToPublicKey` - tested
- `decompressPubKey` - tested
- EIP-712 functions - tested

---

## Optimization Tasks

### Task 1: Replace crypto-js with @noble/hashes in sdk-ts

**File:** `/Users/leeruianthomas/Public/injective/injective-ts/packages/sdk-ts/src/utils/crypto.ts`

**Changes needed:**

```typescript
// Before
import CryptoEs from 'crypto-js'

export const sha256 = (data: Uint8Array): Uint8Array => {
  const wordArray = CryptoEs.lib.WordArray.create(data)
  const hash = CryptoEs.SHA256(wordArray)
  return hexToUint8Array(hash.toString())
}

// After
import { sha256 as nobleSha256 } from '@noble/hashes/sha256'
import { ripemd160 as nobleRipemd160 } from '@noble/hashes/ripemd160'

export const sha256 = (data: Uint8Array): Uint8Array => {
  return nobleSha256(data)
}
```

**Steps:**

1. Add `@noble/hashes` to dependencies (already have `@noble/curves`)
2. Replace crypto-js imports with @noble/hashes
3. Update `hashToHex` to use base64 decoding without crypto-js
4. Run existing tests to verify
5. Remove `crypto-js` and `@types/crypto-js` from package.json

---

### Task 2: Move Wallet Enum to ts-types

**From:** `/Users/leeruianthomas/Public/injective/injective-ts/packages/wallets/wallet-base/src/types/enums.ts`

**To:** `/Users/leeruianthomas/Public/injective/injective-ts/packages/ts-types/src/wallet.ts` (new file)

**Enums to move:**

- `Wallet`
- `BroadcastMode`
- `MagicProvider`
- `WalletDeviceType`
- `WalletEventListener`

**Note:** `WalletAction` re-exports from `@injectivelabs/exceptions` - this may need to stay in wallet-base or we need to evaluate if ts-types should depend on exceptions.

**Steps:**

1. Create `src/wallet.ts` in ts-types with moved enums
2. Export from `src/index.ts`
3. Update wallet-base to re-export from ts-types for backwards compatibility
4. Update consumers to import from ts-types directly

---

## Consumer-Side Lazy Loading

### WalletServiceLoader Pattern (MUST KEEP)

**File:** `/Users/leeruianthomas/Public/injective/injective-ui/app/wallet/WalletServiceLoader.ts`

This pattern is **essential** for bundle optimization and cannot be removed:

```typescript
class WalletServiceLoader {
  private initPromise: null | Promise<WalletModule> = null
  private module: null | WalletModule = null

  async getMsgBroadcaster() {
    const mod = await this.load()
    return mod.msgBroadcaster
  }

  private async load(): Promise<WalletModule> {
    if (this.module) return this.module
    if (!this.initPromise) {
      // Dynamic import creates code-splitting boundary
      this.initPromise = import('./index').then((mod) => {
        this.module = mod
        return mod
      })
    }
    return this.initPromise
  }
}

export const walletServiceLoader = new WalletServiceLoader()
export const getMsgBroadcaster = () => walletServiceLoader.getMsgBroadcaster()
```

### How SDK Optimization Helps

| Optimization                 | Impact                                           |
| ---------------------------- | ------------------------------------------------ |
| Remove crypto-js             | Reduces lazy chunk by ~400KB                     |
| Tree-shakeable packages      | Unused wallet strategies excluded                |
| Move Wallet enum to ts-types | Importing Wallet doesn't pull in wallet packages |

The SDK optimizations reduce the **size** of the lazy-loaded chunk. The WalletServiceLoader ensures the chunk **isn't loaded until needed**.

---

## Key File Paths Reference

| Item                         | Path                                                           |
| ---------------------------- | -------------------------------------------------------------- |
| ts-types source              | `injective-ts/packages/ts-types/src/`                          |
| ts-types package.json        | `injective-ts/packages/ts-types/package.json`                  |
| ts-types tsdown.config       | `injective-ts/packages/ts-types/tsdown.config.ts`              |
| wallet-base enums            | `injective-ts/packages/wallets/wallet-base/src/types/enums.ts` |
| wallet-base package.json     | `injective-ts/packages/wallets/wallet-base/package.json`       |
| sdk-ts crypto.ts             | `injective-ts/packages/sdk-ts/src/utils/crypto.ts`             |
| sdk-ts crypto.spec.ts        | `injective-ts/packages/sdk-ts/src/utils/crypto.spec.ts`        |
| sdk-ts package.json          | `injective-ts/packages/sdk-ts/package.json`                    |
| vitest.config.ts             | `injective-ts/vitest.config.ts`                                |
| Consumer WalletServiceLoader | `injective-ui/app/wallet/WalletServiceLoader.ts`               |

---

## Next Steps

1. **Immediate:** Replace crypto-js with @noble/hashes in sdk-ts
2. **Follow-up:** Move Wallet enum to ts-types
3. **Verify:** Run bundle analysis after changes to measure improvement
4. **Document:** Update SDK migration guides
