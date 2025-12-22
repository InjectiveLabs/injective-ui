# @injectivelabs/sdk-ts Subpath Migration Guide

## TL;DR

| Import Type                                    | Subpath                               |
| ---------------------------------------------- | ------------------------------------- |
| Type-only imports (`import type`)              | Keep barrel (`@injectivelabs/sdk-ts`) |
| `Msg*` classes                                 | `/core/modules`                       |
| `PrivateKey`, `Address`, `BaseAccount`         | `/core/accounts`                      |
| API clients (`ChainGrpc*`, `IndexerGrpc*`)     | `/client/chain`, `/client/indexer`    |
| Utility functions (`getEthereumAddress`, etc.) | `/utils`                              |
| Enums (`TokenType`, `TokenVerification`)       | `/types`                              |
| `TokenStaticFactory`, `TokenPrice`             | `/service`                            |

---

## Table of Contents

- [Overview](#overview)
- [Requirements](#requirements)
- [Quick Reference: Import Mapping](#quick-reference-import-mapping)
- [Migration Examples by Category](#migration-examples-by-category)
- [Step-by-Step Migration](#step-by-step-migration)
- [Common Patterns](#common-patterns)
- [IDE Configuration](#ide-configuration)
- [Bundle Size Verification](#bundle-size-verification)
- [Troubleshooting](#troubleshooting)
- [Completed Migrations](#completed-migrations)
- [Tips for Multi-Repo Migration](#tips-for-multi-repo-migration)

---

## Overview

This guide helps you migrate from barrel imports (`@injectivelabs/sdk-ts`) to subpath imports (`@injectivelabs/sdk-ts/client/indexer`, etc.).

### Why Migrate?

| Benefit                   | Description                                        |
| ------------------------- | -------------------------------------------------- |
| **Smaller bundles**       | Tree-shaking works better with targeted imports    |
| **Faster builds**         | Less code to parse and analyze                     |
| **Explicit dependencies** | Clear understanding of what your code uses         |
| **Future-proof**          | Subpaths are the recommended pattern going forward |

---

## Requirements

| Requirement             | Version           | Notes                                     |
| ----------------------- | ----------------- | ----------------------------------------- |
| `@injectivelabs/sdk-ts` | `>=1.14.14`       | First version with subpath exports        |
| Node.js                 | `>=18`            | Required for native fetch in some APIs    |
| TypeScript              | `>=5.0`           | For `moduleResolution: "bundler"` support |
| Nuxt (if applicable)    | `>=3.8` or Nuxt 4 | Auto-configures `moduleResolution`        |

### Compatibility

The main entry point (`@injectivelabs/sdk-ts`) still works and re-exports everything. This is a **hybrid setup** to prevent breaking changes - you can migrate incrementally.

### Prerequisites

Before starting the migration, ensure your `tsconfig.json` has the correct `moduleResolution`:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

> **Note for Nuxt projects**: Nuxt 4 sets `moduleResolution: "Bundler"` automatically. No changes needed.

### Type-Only Imports

**Type-only imports can use the barrel export** (`@injectivelabs/sdk-ts`) because TypeScript erases them at compile time. They don't affect bundle size.

```typescript
// ✅ Type-only imports from barrel are fine - they're erased at compile time
import type { TokenStatic, SpotMarket, Msgs } from '@injectivelabs/sdk-ts'

// ✅ Value imports should use subpaths for tree-shaking
import { TokenType, TokenVerification } from '@injectivelabs/sdk-ts/types'
import { MsgSend, MsgDelegate } from '@injectivelabs/sdk-ts/core/modules'
```

**Guideline:**

- Use `type` keyword for type-only imports (keeps code clean, single source of truth)
- Use subpaths for **value imports** (enums, classes, functions, constants)

---

## Quick Reference: Import Mapping

### Subpath Overview

| Subpath           | Primary Exports                                             | Use When You Need                                |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| `/client/indexer` | `IndexerGrpc*Api`, `IndexerRest*Api`, Streams, Transformers | Indexer data (markets, orders, trades, accounts) |
| `/client/chain`   | `ChainGrpc*Api`, `ChainRest*Api`, Transformers              | On-chain queries (bank, staking, gov, exchange)  |
| `/client/wasm`    | WASM query helpers (swap, neptune, nameservice)             | Smart contract interactions                      |
| `/client/abacus`  | `AbacusGrpcApi`                                             | Abacus service                                   |
| `/client/olp`     | `OLPGrpcApi`, `DmmGrpcApi`                                  | OLP/DMM service                                  |
| `/core/modules`   | All `Msg*` classes, `ExecArg*` classes                      | Building transaction messages                    |
| `/core/accounts`  | `Address`, `PrivateKey`, `PublicKey`, `BaseAccount`         | Key management, address utilities                |
| `/core/tx`        | `createTransaction`, `TxGrpcApi`, `MsgBroadcasterWithPk`    | Transaction creation & broadcasting              |
| `/types`          | `TokenType`, `Coin`, `TradeDirection`, pagination types     | Type definitions                                 |
| `/utils`          | Address utils, encoding, numbers, crypto, time              | Utility functions                                |
| `/service`        | `TokenPrice`, `TokenStaticFactory`                          | Token services                                   |
| `/cosmjs`         | `InjectiveStargateClient`, wallets, account parser          | CosmJS integration                               |
| `/exports`        | Same as `/cosmjs` (with deprecation notice on signers)      | Legacy CosmJS exports                            |

---

## Migration Examples by Category

### 1. Indexer Clients & Streams

```typescript
// ❌ Before
import {
  IndexerGrpcSpotApi,
  IndexerGrpcSpotStream,
  IndexerGrpcAccountApi,
  IndexerGrpcSpotTransformer,
  IndexerGrpcDerivativesApi
} from '@injectivelabs/sdk-ts'

// ✅ After
import {
  IndexerGrpcSpotApi,
  IndexerGrpcSpotStream,
  IndexerGrpcAccountApi,
  IndexerGrpcSpotTransformer,
  IndexerGrpcDerivativesApi
} from '@injectivelabs/sdk-ts/client/indexer'
```

**All Indexer Exports:**

- **gRPC APIs**: `IndexerGrpcMetaApi`, `IndexerGrpcMitoApi`, `IndexerGrpcSpotApi`, `IndexerGrpcOracleApi`, `IndexerGrpcWeb3GwApi`, `IndexerGrpcAccountApi`, `IndexerGrpcAuctionApi`, `IndexerGrpcTradingApi`, `IndexerGrpcCampaignApi`, `IndexerGrpcArchiverApi`, `IndexerGrpcExplorerApi`, `IndexerGrpcReferralApi`, `IndexerGrpcMegaVaultApi`, `IndexerGrpcDerivativesApi`, `IndexerGrpcTransactionApi`, `IndexerGrpcInsuranceFundApi`, `IndexerGrpcAccountPortfolioApi`
- **REST APIs**: `IndexerRestExplorerApi`, `IndexerRestSpotChronosApi`, `IndexerRestMarketChronosApi`, `IndexerRestDerivativesChronosApi`, `IndexerRestLeaderboardChronosApi`
- **Streams**: `IndexerGrpcMitoStream`, `IndexerGrpcSpotStream`, `IndexerGrpcOracleStream`, `IndexerGrpcAccountStream`, `IndexerGrpcAuctionStream`, `IndexerGrpcTradingStream`, `IndexerGrpcArchiverStream`, `IndexerGrpcExplorerStream`, `IndexerGrpcDerivativesStream`, `IndexerGrpcAccountPortfolioStream`
- **Transformers**: `IndexerCampaignTransformer`, `IndexerGrpcMitoTransformer`, `IndexerGrpcSpotTransformer`, `IndexerGrpcOracleTransformer`, `IndexerSpotStreamTransformer`, `IndexerGrpcAccountTransformer`, `IndexerGrpcAuctionTransformer`, `IndexerGrpcArchiverTransformer`, `IndexerGrpcExplorerTransformer`, `IndexerGrpcReferralTransformer`, `IndexerOracleStreamTransformer`, `IndexerRestExplorerTransformer`, `IndexerAccountStreamTransformer`, `IndexerAuctionStreamTransformer`, `IndexerGrpcMegaVaultTransformer`, `IndexerArchiverStreamTransformer`, `IndexerExplorerStreamTransformer`, `IndexerGrpcDerivativeTransformer`, `IndexerGrpcMitoStreamTransformer`, `IndexerAccountPortfolioTransformer`, `IndexerDerivativeStreamTransformer`, `IndexerGrpcInsuranceFundTransformer`, `IndexerAccountPortfolioStreamTransformer`
- **Types**: All indexer-related types (spot, derivatives, oracle, auction, etc.)
- **Constants**: `IndexerModule`

---

### 2. Chain Clients

```typescript
// ❌ Before
import {
  ChainGrpcAuthApi,
  ChainGrpcBankApi,
  ChainGrpcStakingApi,
  ChainGrpcExchangeApi,
  ChainRestTendermintApi,
  ChainGrpcBankTransformer
} from '@injectivelabs/sdk-ts'

// ✅ After
import {
  ChainGrpcAuthApi,
  ChainGrpcBankApi,
  ChainGrpcStakingApi,
  ChainGrpcExchangeApi,
  ChainRestTendermintApi,
  ChainGrpcBankTransformer
} from '@injectivelabs/sdk-ts/client/chain'
```

**All Chain Exports:**

- **gRPC APIs**: `ChainGrpcEvmApi`, `ChainGrpcGovApi`, `ChainGrpcIbcApi`, `ChainGrpcAuthApi`, `ChainGrpcBankApi`, `ChainGrpcMintApi`, `ChainGrpcWasmApi`, `ChainGrpcAuthZApi`, `ChainGrpcErc20Api`, `ChainGrpcPeggyApi`, `ChainGrpcWasmXApi`, `ChainGrpcOracleApi`, `ChainGrpcTxFeesApi`, `ChainGrpcAuctionApi`, `ChainGrpcStakingApi`, `ChainGrpcExchangeApi`, `ChainGrpcTendermintApi`, `ChainGrpcPermissionsApi`, `ChainGrpcDistributionApi`, `ChainGrpcTokenFactoryApi`, `ChainGrpcInsuranceFundApi`
- **REST APIs**: `ChainRestAuthApi`, `ChainRestBankApi`, `ChainRestWasmApi`, `ChainRestTendermintApi`
- **Transformers**: `ChainGrpcEvmTransformer`, `ChainGrpcGovTransformer`, `ChainGrpcAuthTransformer`, `ChainGrpcBankTransformer`, `ChainGrpcMintTransformer`, `ChainGrpcWasmTransformer`, `ChainGrpcAuthZTransformer`, `ChainGrpcErc20Transformer`, `ChainGrpcPeggyTransformer`, `ChainGrpcCommonTransformer`, `ChainGrpcTxFeesTransformer`, `ChainGrpcAuctionTransformer`, `ChainGrpcStakingTransformer`, `ChainGrpcExchangeTransformer`, `ChainGrpcPermissionsTransformer`, `ChainGrpcDistributionTransformer`, `ChainGrpcTokenFactoryTransformer`, `ChainGrpcInsuranceFundTransformer`
- **Types**: All chain-related types
- **Constants**: `ChainModule`
- **Maps**: `OracleTypeMap`, `GrpcOrderTypeMap`

---

### 3. Transaction Messages (Msg Classes)

```typescript
// ❌ Before
import {
  MsgSend,
  MsgGrant,
  MsgDelegate,
  MsgExecuteContract,
  MsgCreateSpotLimitOrder
} from '@injectivelabs/sdk-ts'

// ✅ After
import {
  MsgSend,
  MsgGrant,
  MsgDelegate,
  MsgExecuteContract,
  MsgCreateSpotLimitOrder
} from '@injectivelabs/sdk-ts/core/modules'
```

**All Message Exports by Module:**

| Module           | Messages                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bank**         | `MsgSend`, `MsgMultiSend`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **Staking**      | `MsgDelegate`, `MsgUndelegate`, `MsgEditValidator`, `MsgCreateValidator`, `MsgBeginRedelegate`, `MsgTransferDelegation`, `MsgCancelUnbondingDelegation`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Distribution** | `MsgFundCommunityPool`, `MsgWithdrawDelegatorReward`, `MsgWithdrawValidatorCommission`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Gov**          | `MsgVote`, `MsgGovDeposit`, `MsgSubmitTextProposal`, `MsgSubmitGenericProposal`, `MsgSubmitProposalSpotMarketLaunch`, `MsgSubmitProposalPerpetualMarketLaunch`, `MsgSubmitProposalSpotMarketParamUpdate`, `MsgSubmitProposalPerpetualMarketLaunchV2`, `MsgSubmitProposalExpiryFuturesMarketLaunch`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Exchange**     | `MsgDeposit`, `MsgSignData`, `MsgWithdraw`, `MsgRewardsOptOut`, `MsgCancelSpotOrder`, `MsgExternalTransfer`, `MsgBatchUpdateOrders`, `MsgLiquidatePosition`, `MsgUpdateSpotMarketV2`, `MsgReclaimLockedFunds`, `MsgCancelPostOnlyModeV2`, `MsgAuthorizeStakeGrants`, `MsgCreateSpotLimitOrder`, `MsgBatchCancelSpotOrders`, `MsgCancelDerivativeOrder`, `MsgCreateSpotMarketOrder`, `MsgIncreasePositionMargin`, `MsgInstantSpotMarketLaunch`, `MsgUpdateDerivativeMarketV2`, `MsgCancelBinaryOptionsOrder`, `MsgCreateDerivativeLimitOrder`, `MsgBatchCancelDerivativeOrders`, `MsgCreateDerivativeMarketOrder`, `MsgCreateBinaryOptionsLimitOrder`, `MsgAdminUpdateBinaryOptionsMarket`, `MsgBatchCancelBinaryOptionsOrders`, `MsgCreateBinaryOptionsMarketOrder`, `MsgSetDelegationTransferReceivers`, `MsgInstantBinaryOptionsMarketLaunch` |
| **Authz**        | `MsgGrant`, `MsgRevoke`, `MsgAuthzExec`, `MsgGrantWithAuthorization`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Feegrant**     | `MsgGrantAllowance`, `MsgRevokeAllowance`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **IBC**          | `MsgTransfer`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Peggy**        | `MsgSendToEth`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Auction**      | `MsgBid`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Insurance**    | `MsgUnderwrite`, `MsgRequestRedemption`, `MsgCreateInsuranceFund`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **TokenFactory** | `MsgMint`, `MsgBurn`, `MsgChangeAdmin`, `MsgCreateDenom`, `MsgSetDenomMetadata`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Permissions**  | `MsgUpdateParams`, `MsgClaimVoucher`, `MsgCreateNamespace`, `MsgUpdateNamespace`, `MsgUpdateActorRoles`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **WASM**         | `MsgStoreCode`, `MsgUpdateAdmin`, `MsgExecuteContract`, `MsgMigrateContract`, `MsgInstantiateContract`, `MsgExecuteContractCompat`, `MsgPrivilegedExecuteContract`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

**Exec Args (for WASM):**

`ExecArgCW20Send`, `ExecArgSubmitVaa`, `ExecArgCreateRound`, `ExecArgCW20Transfer`, `ExecArgFundCampaign`, `ExecArgDepositTokens`, `ExecArgSwapMinOutput`, `ExecArgCreateCampaign`, `ExecArgNeptuneDeposit`, `ExecArgNeptuneWithdraw`, `ExecArgSwapExactOutput`, `ExecArgInitiateTransfer`, `ExecArgUpdateGridConfig`, `ExecArgIncreaseAllowance`, `ExecArgRemoveGridStrategy`, `ExecArgCreatePerpGridStrategy`, `ExecArgCreateSpotGridStrategy`, `ExecPrivilegedArgVaultRedeem`, `ExecPrivilegedArgVaultSubscribe`, `ExecArgCW20AdapterRedeemAndTransfer`, `ExecPrivilegedArgOffChainVaultRedeem`, `ExecPrivilegedArgOffChainVaultSubscribe`

**Message Type Unions:**

`Msgs`, `GovMsgs`, `IbcMsgs`, `BankMsgs`, `WasmMsgs`, `AuthzMsgs`, `Erc20Msgs`, `PeggyMsgs`, `AuctionMsgs`, `ExchangeMsgs`, `StakingMsgs`, `FeegrantMsgs`, `InsuranceMsgs`, `ExchangeV1Msgs`, `ExchangeV2Msgs`, `DistributionMsgs`, `TokenFactoryMsgs`

**Helper Functions:**

- `msgsOrMsgExecMsgs` - Wraps messages in MsgExec if needed for authz
- `getGenericAuthorizationFromMessageType` - Creates generic authorization for message types
- `MsgGrantWithAuthorization` - Grant with specific authorization type
- `ContractExecutionCompatAuthz` - Authorization for contract execution

---

### 4. Accounts & Keys

```typescript
// ❌ Before
import {
  Address,
  PublicKey,
  PrivateKey,
  BaseAccount
} from '@injectivelabs/sdk-ts'

// ✅ After
import {
  Address,
  PublicKey,
  PrivateKey,
  BaseAccount
} from '@injectivelabs/sdk-ts/core/accounts'
```

---

### 5. Transaction Creation & Broadcasting

```typescript
// ❌ Before
import {
  TxRestApi,
  TxGrpcApi,
  TxClient,
  createTransaction,
  MsgBroadcasterWithPk,
  createTransactionWithSigners
} from '@injectivelabs/sdk-ts'

// ✅ After
import {
  TxRestApi,
  TxGrpcApi,
  TxClient,
  createTransaction,
  MsgBroadcasterWithPk,
  createTransactionWithSigners
} from '@injectivelabs/sdk-ts/core/tx'
```

**All Transaction Exports:**

- **Transaction Creation**: `createTransaction`, `createTransactionFromMsg`, `createTransactionWithSigners`, `createTransactionAndCosmosSignDoc`, `createTransactionAndCosmosSignDocForAddressAndMsg`
- **APIs**: `TxRestApi`, `TxGrpcApi`
- **Broadcasting**: `MsgBroadcasterWithPk`
- **Utilities**: `TxClient`, `generateArbitrarySignDoc`
- **EIP-712**: EIP-712 utilities, maps, `MsgDecoder`
- **Proto**: `CosmosTxV1Beta1TxPb`

---

### 6. Utility Functions

```typescript
// ❌ Before
import {
  getEthereumAddress,
  getInjectiveAddress,
  getDefaultSubaccountId,
  spotPriceToChainPriceToFixed,
  denomAmountToChainDenomAmountToFixed
} from '@injectivelabs/sdk-ts'

// ✅ After
import {
  getEthereumAddress,
  getInjectiveAddress,
  getDefaultSubaccountId,
  spotPriceToChainPriceToFixed,
  denomAmountToChainDenomAmountToFixed
} from '@injectivelabs/sdk-ts/utils'
```

**All Utility Exports:**

| Category        | Functions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Address**     | `getSubaccountId`, `getEthereumAddress`, `getInjectiveAddress`, `getDefaultSubaccountId`, `getInjectiveAddressFromSubaccountId`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Encoding**    | `toUtf8`, `fromUtf8`, `toBase64`, `hexToBuff`, `fromBase64`, `hexToBase64`, `base64ToUtf8`, `hexToUint8Array`, `uint8ArrayToHex`, `stringToUint8Array`, `binaryToBase64`, `uint8ArrayToString`, `base64ToUint8Array`, `uint8ArrayToBase64`, `concatUint8Arrays`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Numbers**     | `isNumber`, `getTensMultiplier`, `numberToCosmosSdkDecString`, `formatAmountToAllowableAmount`, `formatPriceToAllowablePrice`, `getSpotMarketDecimals`, `getSpotMarketTensMultiplier`, `formatNumberToAllowableDecimals`, `getDerivativeMarketDecimals`, `spotPriceToChainPriceToFixed`, `spotPriceFromChainPriceToFixed`, `getDerivativeMarketTensMultiplier`, `spotQuantityToChainQuantityToFixed`, `spotQuantityFromChainQuantityToFixed`, `derivativePriceToChainPriceToFixed`, `denomAmountToChainDenomAmountToFixed`, `derivativePriceFromChainPriceToFixed`, `denomAmountFromChainDenomAmountToFixed`, `derivativeMarginToChainMarginToFixed`, `derivativeQuantityToChainQuantityToFixed`, `derivativeMarginFromChainMarginToFixed`, `derivativeQuantityFromChainQuantityToFixed` |
| **Crypto**      | `sha256`, `ripemd160`, `hashToHex`, `domainHash`, `messageHash`, `decompressPubKey`, `sanitizeTypedData`, `publicKeyToAddress`, `privateKeyToPublicKey`, `privateKeyHashToPublicKey`, `privateKeyToPublicKeyBase64`, `privateKeyHashToPublicKeyBase64`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **Time**        | `makeTimeoutTimestamp`, `makeTimeoutTimestampInNs`, `protobufTimestampToDate`, `protobufTimestampToUnixMs`, `protobufTimestampToUnixSeconds`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **Pagination**  | `grpcPagingToPaging`, `grpcPagingToPagingV2`, `fetchAllWithPagination`, `grpcPaginationToPagination`, `paginationUint8ArrayToString`, `paginationRequestFromPagination`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Helpers**     | `isNode`, `isBrowser`, `objectToJson`, `isServerSide`, `isReactNative`, `sortObjectByKeys`, `grpcCoinToUiCoin`, `protoObjectToJson`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| **gRPC**        | `getGrpcWebTransport`, `GrpcWebFetchTransport`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Transaction** | `getGasPriceBasedOnMessage`, `recoverTypedSignaturePubKey`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Constants**   | `DEFAULT_DERIVATION_PATH`, `BECH32_ADDR_ACC_PREFIX`, `BECH32_ADDR_VAL_PREFIX`, `BECH32_ADDR_CONS_PREFIX`, `BECH32_PUBKEY_ACC_PREFIX`, `BECH32_PUBKEY_VAL_PREFIX`, `BECH32_PUBKEY_CONS_PREFIX`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

---

### 7. Types

```typescript
// ❌ Before
import type {
  Coin,
  TokenType,
  TokenStatic,
  TradeDirection,
  PaginationOption
} from '@injectivelabs/sdk-ts'

// ✅ After
import type {
  Coin,
  TokenType,
  TokenStatic,
  TradeDirection,
  PaginationOption
} from '@injectivelabs/sdk-ts/types'
```

**All Type Exports:**

- **Token**: `TokenMeta`, `TokenType`, `TokenSource`, `TokenStatic`, `TokenVerification`
- **Cosmos**: `Coin`, `TxRaw`, `SignDoc`, `GrpcCoin`, `StreamOperation`, `AminoSignResponse`, `DirectSignResponse`
- **Exchange**: `OrderMask`, `OrderMaskMap`, `TradeDirection`, `TradeExecutionSide`, `TradeExecutionType`
- **Pagination**: `Pagination`, `PagePagination`, `PaginationOption`, `ExchangePagination`

---

### 8. Token Services

```typescript
// ❌ Before
import { TokenPrice, TokenStaticFactory } from '@injectivelabs/sdk-ts'

// ✅ After
import { TokenPrice, TokenStaticFactory } from '@injectivelabs/sdk-ts/service'
```

**All Service Exports:**

- `TokenPrice` - Fetch token prices from the asset microservice
- `TokenStaticFactory` - Token registry with lookup by denom/symbol/address
- `TokenFactoryStatic` (deprecated) - Legacy token factory

---

### 9. CosmJS Integration

```typescript
// ❌ Before
import {
  MsgTransferCosmjs,
  InjectiveStargateClient,
  injectiveAccountParser,
  InjectiveEthSecp256k1Wallet,
  InjectiveSigningStargateClient,
  InjectiveDirectEthSecp256k1Wallet
} from '@injectivelabs/sdk-ts'

// ✅ After
import {
  MsgTransferCosmjs,
  InjectiveStargateClient,
  injectiveAccountParser,
  InjectiveEthSecp256k1Wallet,
  InjectiveSigningStargateClient,
  InjectiveDirectEthSecp256k1Wallet
} from '@injectivelabs/sdk-ts/cosmjs'
```

**All CosmJS Exports:**

- `MsgTransferCosmjs`
- `InjectiveStargateClient`
- `injectiveAccountParser`
- `InjectiveEthSecp256k1Wallet`
- `InjectiveSigningStargateClient`
- `InjectiveDirectEthSecp256k1Wallet`

---

### 10. WASM Clients (Swap, Neptune, etc.)

```typescript
// ✅ After
import { NEPTUNE_PRICE_CONTRACT } from '@injectivelabs/sdk-ts/client/wasm'
```

**All WASM Exports:**

- **Types**: `WasmContractQueryResponse`
- **Swap**: Types, transformer, queries
- **Neptune**: Types, service, transformer, queries, `NEPTUNE_PRICE_CONTRACT`
- **Incentives**: Types, transformer, queries
- **Nameservice**: Transformer, queries
- **Trading Strategies**: Queries

---

### 11. Abacus & OLP Clients

```typescript
// ❌ Before
import { OLPGrpcApi, AbacusGrpcApi } from '@injectivelabs/sdk-ts'

// ✅ After
import { AbacusGrpcApi } from '@injectivelabs/sdk-ts/client/abacus'
import { OLPGrpcApi, DmmGrpcApi } from '@injectivelabs/sdk-ts/client/olp'
```

---

## Step-by-Step Migration

### Step 1: Verify Prerequisites

```bash
# Check your moduleResolution setting (should be "bundler", "node16", or "nodenext")
grep -r "moduleResolution" tsconfig.json .nuxt/tsconfig*.json 2>/dev/null
```

For Nuxt projects, ensure you're on Nuxt 3.8+ or Nuxt 4 (they set `moduleResolution: "Bundler"` automatically).

### Step 2: Find All SDK Imports

```bash
# Find all files with sdk-ts imports
grep -r "@injectivelabs/sdk-ts" --include="*.ts" --include="*.vue" -l app/

# Count imports by type (barrel vs subpath)
grep -r "from '@injectivelabs/sdk-ts'" --include="*.ts" --include="*.vue" app/ | wc -l
grep -r "from '@injectivelabs/sdk-ts/" --include="*.ts" --include="*.vue" app/ | wc -l
```

### Step 3: Categorize Imports

For each file, identify what needs to change:

| Import Type                              | Action                                          |
| ---------------------------------------- | ----------------------------------------------- |
| `import type { X } from '...sdk-ts'`     | ✅ Keep as-is (type-only, erased at compile)    |
| `import { MsgSend } from '...sdk-ts'`    | ⚠️ Migrate to `/core/modules`                   |
| `import { PrivateKey } from '...sdk-ts'` | ⚠️ Migrate to `/core/accounts`                  |
| `import { TokenType } from '...sdk-ts'`  | ⚠️ Migrate to `/types`                          |
| `import { getEthereumAddress } from`     | ⚠️ Migrate to `/utils`                          |
| `import { ChainGrpcBankApi } from`       | ⚠️ Migrate to `/client/chain` (consider lazy)   |
| `import { IndexerGrpcSpotApi } from`     | ⚠️ Migrate to `/client/indexer` (consider lazy) |

### Step 4: Apply Migrations

**Option A: Direct Static Imports (Simple)**

Replace barrel imports with subpath imports directly:

```typescript
// Before
import {
  MsgSend,
  PrivateKey,
  getEthereumAddress,
  TokenType
} from '@injectivelabs/sdk-ts'

// After
import { MsgSend } from '@injectivelabs/sdk-ts/core/modules'
import { PrivateKey } from '@injectivelabs/sdk-ts/core/accounts'
import { getEthereumAddress } from '@injectivelabs/sdk-ts/utils'
import { TokenType } from '@injectivelabs/sdk-ts/types'
```

**Option B: Lazy-Loading API Factory (Recommended for APIs)**

For API clients (ChainGrpc*, IndexerGrpc*, etc.), use the lazy-loading factory pattern for better performance:

```typescript
// utils/lib/sdkImports.ts - Create once, use everywhere
const apiCache = new Map<string, unknown>()

function createApiFactory<T>(
  className: string,
  importFn: () => Promise<new (endpoint: string) => T>
): (endpoint: string) => Promise<T> {
  return async (endpoint: string) => {
    const key = `${className}-${endpoint}`
    if (apiCache.has(key)) {
      return apiCache.get(key) as T
    }
    const ApiClass = await importFn()
    const instance = new ApiClass(endpoint)
    apiCache.set(key, instance)
    return instance
  }
}

// Add factories for each API you use
export const getChainGrpcBankApi = createApiFactory(
  'ChainGrpcBankApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/chain')).ChainGrpcBankApi
)

export const getIndexerGrpcSpotApi = createApiFactory(
  'IndexerGrpcSpotApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/indexer')).IndexerGrpcSpotApi
)
```

Then create bound helpers in your service layer:

```typescript
// service/index.ts
import { getChainGrpcBankApi } from '../utils/lib/sdkImports'
import { ENDPOINTS } from '../utils/constant'

export const getBankApi = () => getChainGrpcBankApi(ENDPOINTS.grpc)
```

Usage in your code:

```typescript
// Before (synchronous)
const bankApi = new ChainGrpcBankApi(ENDPOINTS.grpc)
const balance = await bankApi.fetchBalance(...)

// After (async, lazy-loaded)
const bankApi = await getBankApi()
const balance = await bankApi.fetchBalance(...)
```

### Step 5: Verify and Test

```bash
# Check TypeScript compiles without errors
pnpm tsc --noEmit

# Run your test suite
pnpm test

# Build and check bundle size (optional)
pnpm build
```

---

## Migration Checklist

- [ ] **Prerequisites**: Verify `moduleResolution` is `bundler`, `node16`, or `nodenext`
- [ ] **Audit imports**: `grep -r "@injectivelabs/sdk-ts" --include="*.ts" --include="*.vue" -l app/`
- [ ] **Categorize**: Separate type-only imports from value imports
- [ ] **Create factory file**: Copy `utils/lib/sdkImports.ts` pattern for API clients
- [ ] **Update value imports**: Replace barrel imports with subpath imports
- [ ] **Keep type imports**: Leave `import type { ... } from '@injectivelabs/sdk-ts'` as-is
- [ ] **Verify TypeScript**: `pnpm tsc --noEmit`
- [ ] **Test functionality**: `pnpm test`
- [ ] **Check bundle size**: Compare before/after with `pnpm build` (optional)

---

## Common Patterns

### Re-exporting SDK Types

If your application re-exports SDK types for convenience, this is fine:

```typescript
// types/index.ts - Re-exporting types is acceptable
export type { TokenStatic, SpotMarket, Msgs } from '@injectivelabs/sdk-ts'

// For values (enums, classes), use subpaths
export { TokenType, TokenVerification } from '@injectivelabs/sdk-ts/types'
```

### Testing with Lazy-Loaded Factories

When testing code that uses lazy-loaded API factories, mock the factory functions:

```typescript
// __tests__/example.test.ts
import { vi } from 'vitest'

// Mock the factory
vi.mock('../utils/lib/sdkImports', () => ({
  getChainGrpcBankApi: vi.fn().mockResolvedValue({
    fetchBalance: vi.fn().mockResolvedValue({ amount: '1000000' })
  })
}))

// Your test
it('fetches balance correctly', async () => {
  const balance = await fetchUserBalance('inj1...')
  expect(balance.amount).toBe('1000000')
})
```

### Conditional Imports

For code that runs in both browser and server environments:

```typescript
// Use dynamic imports for environment-specific code
const getApi = async () => {
  if (typeof window === 'undefined') {
    // Server-side: might use different transport
    const { ChainGrpcBankApi } = await import(
      '@injectivelabs/sdk-ts/client/chain'
    )
    return new ChainGrpcBankApi(SERVER_ENDPOINT)
  }
  // Client-side: use cached factory
  return getBankApi()
}
```

---

## IDE Configuration

### VSCode

Add to your `.vscode/settings.json` to improve auto-import suggestions:

```json
{
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "typescript.preferences.importModuleSpecifierEnding": "minimal",
  "editor.codeActionsOnSave": {
    "source.organizeImports": "explicit"
  }
}
```

### WebStorm / IntelliJ

1. Go to **Settings** → **Editor** → **Code Style** → **TypeScript**
2. Under **Imports**, set "Use path mappings from tsconfig.json" to **Always**
3. Enable "Use paths relative to tsconfig.json"

### ESLint Import Ordering

Consider using `eslint-plugin-import` to enforce consistent import ordering:

```javascript
// eslint.config.js
export default [
  {
    rules: {
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
          pathGroups: [
            {
              pattern: '@injectivelabs/sdk-ts/**',
              group: 'external',
              position: 'after'
            }
          ]
        }
      ]
    }
  }
]
```

---

## Bundle Size Verification

### Quick Check with du

```bash
# Before migration - record baseline
pnpm build
du -sh .output/public/_nuxt/*.js | sort -h > bundle-before.txt

# After migration - compare
pnpm build
du -sh .output/public/_nuxt/*.js | sort -h > bundle-after.txt
diff bundle-before.txt bundle-after.txt
```

### Using vite-bundle-visualizer

```bash
# Install
pnpm add -D vite-bundle-visualizer

# Generate report
npx vite-bundle-visualizer

# Opens browser with interactive treemap
```

### Using rollup-plugin-visualizer (Nuxt)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  vite: {
    build: {
      rollupOptions: {
        plugins: [
          process.env.ANALYZE &&
            (await import('rollup-plugin-visualizer')).visualizer({
              open: true,
              filename: 'stats.html',
              gzipSize: true
            })
        ].filter(Boolean)
      }
    }
  }
})
```

```bash
# Run with analysis
ANALYZE=true pnpm build
```

### Expected Improvements

After migration, you should see:

- **Reduced initial bundle**: SDK modules load on-demand
- **Better code splitting**: Vite/Rollup can split SDK code into separate chunks
- **Faster cold starts**: Less JavaScript to parse on initial load

---

## Troubleshooting

### TypeScript can't find the subpath

Ensure your `tsconfig.json` has appropriate `moduleResolution`:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

The `node` resolution mode may not support package.json `exports` properly. Use `bundler`, `node16`, or `nodenext` instead.

### Import not found in subpath

1. Check if the export exists in the subpath (refer to this guide)
2. The export may have been renamed or deprecated
3. Try importing from the barrel first to verify the export exists:
   ```typescript
   // Debug: verify export exists
   import { SomeExport } from '@injectivelabs/sdk-ts'
   console.log(SomeExport) // If this works, find the correct subpath
   ```

### Bundle size didn't decrease

- Ensure your bundler supports tree-shaking (Vite, webpack 5, Rollup, esbuild)
- Check that you're not re-exporting from a barrel file in your own code
- Verify `sideEffects: false` is respected by your bundler
- Check for circular dependencies that prevent tree-shaking

### "Cannot find module" error at runtime

This usually means the `exports` field in `package.json` isn't being respected:

```bash
# Check your Node.js version (should be >= 18)
node --version

# Ensure package-lock.json/pnpm-lock.yaml is up to date
pnpm install --force
```

### ESM/CJS interop issues

If you see errors like `ERR_REQUIRE_ESM` or `exports is not defined`:

```typescript
// Use dynamic import instead of require
const { ChainGrpcBankApi } = await import('@injectivelabs/sdk-ts/client/chain')

// Or configure your bundler to handle ESM
// vite.config.ts
export default {
  build: {
    target: 'esnext'
  }
}
```

### Vite optimizeDeps issues

If Vite fails to pre-bundle SDK dependencies:

```typescript
// nuxt.config.ts or vite.config.ts
export default {
  vite: {
    optimizeDeps: {
      include: [
        '@injectivelabs/sdk-ts/client/chain',
        '@injectivelabs/sdk-ts/client/indexer',
        '@injectivelabs/sdk-ts/core/modules',
        '@injectivelabs/sdk-ts/utils'
      ]
    }
  }
}
```

### Nuxt SSR hydration mismatch

If you see hydration errors with lazy-loaded APIs:

```typescript
// Wrap API calls in client-only context
const bankApi = ref<ChainGrpcBankApi | null>(null)

onMounted(async () => {
  bankApi.value = await getBankApi()
})

// Or use <ClientOnly> wrapper in templates
```

### Type errors after migration

If TypeScript complains about types after migrating value imports:

```typescript
// ❌ Wrong - mixing value and type imports
import { TokenType } from '@injectivelabs/sdk-ts/types'
import type { TokenType } from '@injectivelabs/sdk-ts' // Duplicate!

// ✅ Correct - use one source
import { TokenType } from '@injectivelabs/sdk-ts/types'
import type { TokenStatic } from '@injectivelabs/sdk-ts' // Different export, OK
```

### Circular dependency warnings

If you see circular dependency warnings after migration:

1. Check that your `sdkImports.ts` doesn't import from files that import from it
2. Use dynamic imports to break cycles:
   ```typescript
   // Break cycle with dynamic import
   const getService = async () => {
     const { MyService } = await import('./MyService')
     return new MyService()
   }
   ```

---

## Quick Lookup Table

| If you import...                                                              | Use subpath...    |
| ----------------------------------------------------------------------------- | ----------------- |
| `IndexerGrpc*Api`, `IndexerRest*Api`, `Indexer*Stream`, `Indexer*Transformer` | `/client/indexer` |
| `ChainGrpc*Api`, `ChainRest*Api`, `Chain*Transformer`                         | `/client/chain`   |
| `Msg*` (any message class)                                                    | `/core/modules`   |
| `ExecArg*`, `ExecPrivilegedArg*`                                              | `/core/modules`   |
| `Address`, `PrivateKey`, `PublicKey`, `BaseAccount`                           | `/core/accounts`  |
| `createTransaction*`, `TxGrpcApi`, `TxRestApi`, `MsgBroadcasterWithPk`        | `/core/tx`        |
| `getInjectiveAddress`, `getEthereumAddress`, encoding/number utils            | `/utils`          |
| `TokenType`, `Coin`, `TradeDirection`, pagination types                       | `/types`          |
| `TokenPrice`, `TokenStaticFactory`                                            | `/service`        |
| `InjectiveStargateClient`, `Injective*Wallet`, `injectiveAccountParser`       | `/cosmjs`         |
| WASM queries (Neptune, Swap, etc.)                                            | `/client/wasm`    |
| `AbacusGrpcApi`                                                               | `/client/abacus`  |
| `OLPGrpcApi`, `DmmGrpcApi`                                                    | `/client/olp`     |
| `OracleTypeMap`, `GrpcOrderTypeMap`                                           | `/client/chain`   |
| `isCw20ContractAddress`                                                       | `/utils`          |

---

## Completed Migrations

This section documents the migration patterns used across Injective repositories.

---

### injective-helix Migration

The `injective-helix` repo was migrated using **direct static imports** (not the lazy-loading factory pattern). This approach is simpler and appropriate when:

- You don't need the extra bundle splitting that dynamic imports provide
- The API clients are already used in server-side or build-time contexts
- You prefer straightforward refactoring over architectural changes

#### Key Insights from injective-helix Migration

1. **Only runtime imports need migration** - `import type` statements are erased at compile time and don't affect bundle size
2. **Enum values are runtime imports** - `TokenType`, `TokenVerification`, `TradeDirection`, `ExitType`, `MarketType`, etc.
3. **Constants and maps are runtime imports** - `GrpcOrderTypeMap`, `NEPTUNE_USDT_CW20_CONTRACT`, etc.
4. **Classes are runtime imports** - All `Msg*`, `ExecArg*`, `Query*`, API clients, streams, etc.

#### Files Migrated in injective-helix (63 files)

| Category                   | Files                                                                                                                                                                                                       | Changes                                                                                                                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Store message files**    | `spot/message.ts`, `account/message.ts`, `derivative/message.ts`, `position/message.ts`, `gridStrategy/message.ts`, `megaVault/message.ts`, `referral/message.ts`, `campaign/message.ts`, `swap/message.ts` | `Msg*` classes → `/core/modules`, utility functions → `/utils`                                                                                                                        |
| **Store index files**      | `account/index.ts`, `swap/index.ts`, `campaign/index.ts`, `gridStrategy/index.ts`, `authZ.ts`                                                                                                               | Mixed: Query classes → `/client/wasm`, encoding → `/utils`, `MsgGrant`/`MsgRevoke` → `/core/modules`, `MarketType` → `/client/indexer`                                                |
| **App services**           | `app/Services.ts`, `app/services/account.ts`                                                                                                                                                                | `NeptuneService` → `/client/wasm`, `BaseAccount` → `/core/accounts`, `ChainRestAuthApi` → `/client/chain`                                                                             |
| **Stream clients**         | `app/client/streams/*.ts`                                                                                                                                                                                   | `IndexerGrpc*Stream` → `/client/indexer`                                                                                                                                              |
| **Utility files**          | `app/utils/msgs.ts`, `app/utils/trade.ts`, `app/data/trade.ts`                                                                                                                                              | Multiple imports to appropriate subpaths                                                                                                                                              |
| **Components/Composables** | 20+ files                                                                                                                                                                                                   | `TradeDirection`, `TokenType`, `TokenVerification` → `/types`; `ExitType`, `GrantAuthorizationType` → `/core/modules`; `MarketType` → `/client/indexer`; utility functions → `/utils` |

#### Subpath Mapping Reference (Quick Lookup)

| Export Pattern                                                                                                                                          | Subpath           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `Msg*`, `ExecArg*`, `ExitType`, `GrantAuthorizationType`, `getGenericAuthorizationFromMessageType`, `msgsOrMsgExecMsgs`, `ContractExecutionCompatAuthz` | `/core/modules`   |
| `BaseAccount`, `PrivateKey`, `Address`                                                                                                                  | `/core/accounts`  |
| `IndexerGrpc*Api`, `IndexerGrpc*Stream`, `MarketType`, `TradingStrategy`                                                                                | `/client/indexer` |
| `ChainGrpc*Api`, `ChainRest*Api`, `GrpcOrderTypeMap`, `OracleTypeMap`                                                                                   | `/client/chain`   |
| `NeptuneService`, `NEPTUNE_USDT_CW20_CONTRACT`, `Query*` (WASM), `SwapQueryTransformer`                                                                 | `/client/wasm`    |
| Formatters, encoding utils, address utils, price/quantity converters                                                                                    | `/utils`          |
| `TradeDirection`, `TokenType`, `TokenVerification`, `TokenStatic` (enums/value types)                                                                   | `/types`          |

---

### injective-ui Migration

The `injective-ui` repo was migrated using **lazy-loading API factories** for maximum bundle splitting. This approach is best for large applications where you want to defer loading of heavy SDK modules.

#### Architecture: Lazy-Loading API Factory

We use a factory pattern in `utils/lib/sdkImports.ts` for lazy-loading SDK API clients:

```typescript
// utils/lib/sdkImports.ts
const apiCache = new Map<string, unknown>()

function createApiFactory<T>(
  className: string,
  importFn: () => Promise<new (endpoint: string) => T>
): (endpoint: string) => Promise<T> {
  return async (endpoint: string) => {
    const key = `${className}-${endpoint}`
    if (apiCache.has(key)) {
      return apiCache.get(key) as T
    }
    const ApiClass = await importFn()
    const instance = new ApiClass(endpoint)
    apiCache.set(key, instance)
    return instance
  }
}

// Usage - each factory is just 4 lines
export const getChainGrpcBankApi = createApiFactory(
  'ChainGrpcBankApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/chain')).ChainGrpcBankApi
)
```

Then in `Service/index.ts`, we bind these to configured endpoints:

```typescript
// Service/index.ts
import { getChainGrpcBankApi } from './../utils/lib/sdkImports'
import { ENDPOINTS } from './../utils/constant'

export const getBankApi = () => getChainGrpcBankApi(ENDPOINTS.grpc)
```

#### Files Migrated in injective-ui

| File                                     | Changes                                                                       |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| `utils/lib/sdkImports.ts`                | 26+ API factory functions using dynamic imports                               |
| `Service/index.ts`                       | Replaced `lazyImportSdkTs` with factory functions                             |
| `Service/app/nameService/index.ts`       | Uses `getChainGrpcWasmApi` factory                                            |
| `Service/app/bonfida.ts`                 | Uses `getChainGrpcWasmApi` factory                                            |
| `store/wallet/index.ts`                  | `PrivateKey` → `/core/accounts`, `MsgGrant` → `/core/modules`                 |
| `store/wallet/magic.ts`                  | `getEthereumAddress` → `/utils`                                               |
| `store/wallet/turnkey.ts`                | `getEthereumAddress` → `/utils`                                               |
| `store/notification.ts`                  | Uses `getChainGrpcTendermintApi` factory                                      |
| `transformer/oracle.ts`                  | `OracleTypeMap` → `/client/chain`                                             |
| `transformer/trade/order.ts`             | `GrpcOrderTypeMap` → `/client/chain`                                          |
| `transformer/common.ts`                  | `paginationUint8ArrayToString` → `/utils`                                     |
| `transformer/explorer/messageSummary.ts` | `base64ToUtf8` → `/utils`                                                     |
| `transformer/explorer/messageEvents.ts`  | `hexToBase64` → `/utils`                                                      |
| `transformer/explorer/index.ts`          | `TokenType, TokenVerification` → `/types`                                     |
| `transformer/market/index.ts`            | `TokenType` → `/types`                                                        |
| `Service/app/tokenClient.ts`             | `TokenType, TokenVerification` → `/types`, `isCw20ContractAddress` → `/utils` |
| `Service/app/SharedTokenClientStatic.ts` | Same as above                                                                 |
| `Service/app/nameService/utils.ts`       | Encoding utils → `/utils`                                                     |
| `classes/TokenFactoryStatic.ts`          | `TokenType, TokenVerification` → `/types`, `isCw20ContractAddress` → `/utils` |
| `classes/Tokens.ts`                      | `TokenVerification` → `/types`, `TokenFactoryStatic` → `/service`             |
| `utils/ibc.ts`                           | `TokenType` → `/types`                                                        |
| `data/token.ts`                          | `TokenType, TokenVerification` → `/types`                                     |
| `utils/evm/CustomEip1193Provider.ts`     | `PrivateKey` → `/core/accounts`                                               |

#### Pattern: Mixed Imports (Correct)

Files can use both subpath imports (for values) and barrel imports (for types):

```typescript
// ✅ Correct pattern - used in store/wallet/index.ts
import { PrivateKey } from '@injectivelabs/sdk-ts/core/accounts'
import { MsgGrant, msgsOrMsgExecMsgs } from '@injectivelabs/sdk-ts/core/modules'
import {
  getEthereumAddress,
  getInjectiveAddress
} from '@injectivelabs/sdk-ts/utils'
import type { Msgs, ContractExecutionCompatAuthz } from '@injectivelabs/sdk-ts'
```

#### Remaining Barrel Imports (Type-Only)

These files correctly use type-only imports from the barrel:

| File                      | Types Imported                                  |
| ------------------------- | ----------------------------------------------- |
| `types/*.ts`              | Various SDK types for re-export                 |
| `store/*.ts`              | `TokenStatic`, `SpotMarket`, `TxResponse`, etc. |
| `transformer/**/*.ts`     | `Coin`, `Message`, `EventLog`, etc.             |
| `providers/cacheApi/*.ts` | `Validator`, `Pagination`, etc.                 |
| `utils/formatter.ts`      | `Coin`                                          |
| `utils/helper.ts`         | `TokenStatic`                                   |
| `data/token.ts`           | `TokenStatic`                                   |

These are acceptable because `import type` is erased at compile time

---

## Common Pitfalls

### 1. Mixing Value and Type Imports Incorrectly

```typescript
// ❌ Wrong - TokenType is an enum (value), not just a type
import type { TokenType, TokenStatic } from '@injectivelabs/sdk-ts'

// ✅ Correct - TokenStatic is type-only, TokenType is a value
import { TokenType } from '@injectivelabs/sdk-ts/types'
import type { TokenStatic } from '@injectivelabs/sdk-ts'
```

### 2. Forgetting to Make API Calls Async

When switching to lazy-loaded factories, API access becomes async:

```typescript
// ❌ Before (synchronous instantiation)
const bankApi = new ChainGrpcBankApi(endpoint)
const balance = bankApi.fetchBalance(address, denom)

// ✅ After (async factory)
const bankApi = await getBankApi()
const balance = await bankApi.fetchBalance(address, denom)
```

### 3. Not Updating All Import Locations

Use grep to find all occurrences, not just a few:

```bash
# Find ALL files that import from sdk-ts barrel
grep -r "from '@injectivelabs/sdk-ts'" --include="*.ts" --include="*.vue" app/
```

### 4. Enum vs Const Maps

Some exports are `const` objects (maps), not enums:

```typescript
// OracleTypeMap is a const object, not an enum
import { OracleTypeMap } from '@injectivelabs/sdk-ts/client/chain'

// Usage: OracleTypeMap.Pyth, OracleTypeMap.Chainlink, etc.
```

---

## Tips for Multi-Repo Migration

If you're migrating multiple repos with similar setups:

1. **Choose your approach**:
   - **Lazy-loading factories** (`injective-ui` pattern): Best for large apps where you want maximum bundle splitting
   - **Direct static imports** (`injective-helix` pattern): Simpler refactoring, still gets tree-shaking benefits
2. **Reference implementations**:
   - `injective-ui`: Lazy-loading factory pattern with `utils/lib/sdkImports.ts`
   - `injective-helix`: Direct static imports, 63 files migrated
3. **Use search-and-replace patterns**:
   ```bash
   # Find common patterns to migrate
   grep -r "import { TokenType" --include="*.ts" app/
   grep -r "import { MsgSend\|MsgGrant\|MsgDelegate" --include="*.ts" app/
   grep -r "import { PrivateKey" --include="*.ts" app/
   ```
4. **Migrate incrementally**: Type-only imports can stay in barrel, focus on value imports
5. **Test after each batch**: Don't migrate everything at once

### Quick Migration Patterns for Common Imports

```bash
# Replace TokenType imports
sed -i '' "s/import { TokenType } from '@injectivelabs\/sdk-ts'/import { TokenType } from '@injectivelabs\/sdk-ts\/types'/g" *.ts

# Replace PrivateKey imports
sed -i '' "s/import { PrivateKey } from '@injectivelabs\/sdk-ts'/import { PrivateKey } from '@injectivelabs\/sdk-ts\/core\/accounts'/g" *.ts

# Replace utility function imports
sed -i '' "s/import { getEthereumAddress } from '@injectivelabs\/sdk-ts'/import { getEthereumAddress } from '@injectivelabs\/sdk-ts\/utils'/g" *.ts
```

> **Warning**: Always review sed changes before committing. Use `git diff` to verify.
