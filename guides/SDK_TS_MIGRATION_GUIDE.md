# @injectivelabs/sdk-ts Subpath Migration Guide

## Overview

This guide helps you migrate from barrel imports (`@injectivelabs/sdk-ts`) to subpath imports (`@injectivelabs/sdk-ts/client/indexer`, etc.).

### Why Migrate?

| Benefit                   | Description                                        |
| ------------------------- | -------------------------------------------------- |
| **Smaller bundles**       | Tree-shaking works better with targeted imports    |
| **Faster builds**         | Less code to parse and analyze                     |
| **Explicit dependencies** | Clear understanding of what your code uses         |
| **Future-proof**          | Subpaths are the recommended pattern going forward |

### Compatibility

The main entry point (`@injectivelabs/sdk-ts`) still works and re-exports everything. This is a **hybrid setup** to prevent breaking changes - you can migrate incrementally.

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

## Migration Checklist

- [ ] **Audit imports**: Search your codebase for `from '@injectivelabs/sdk-ts'`
- [ ] **Categorize**: Group imports by their target subpath
- [ ] **Update imports**: Replace barrel imports with subpath imports
- [ ] **Verify TypeScript**: Run `tsc --noEmit` to check for type errors
- [ ] **Test functionality**: Ensure runtime behavior is unchanged
- [ ] **Check bundle size**: Compare before/after bundle sizes (optional)

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

### Bundle size didn't decrease

- Ensure your bundler supports tree-shaking (Vite, webpack 5, Rollup, esbuild)
- Check that you're not re-exporting from a barrel file in your own code
- Verify `sideEffects: false` is respected by your bundler

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

## Completed Migration in This Codebase

This section documents the migration patterns used in `injective-ui`.

### Architecture: Lazy-Loading API Factory

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

### Files Migrated

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

### Pattern: Mixed Imports (Correct)

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

### Remaining Barrel Imports (Type-Only)

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
