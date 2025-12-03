import { MsgType } from '@injectivelabs/ts-types'

// https://raw.githubusercontent.com/InjectiveLabs/sdk-go/refs/heads/dev/injective_data/chain_messages_list.json

function breakCamelCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2')
}

export const msgTypeMap = Object.fromEntries(
  Object.entries({
    // Cosmos Authz
    [MsgType.MsgExec]: 'Exec',
    [MsgType.MsgGrant]: 'Grant',
    [MsgType.MsgRevoke]: 'Revoke',

    // Cosmos Bank
    [MsgType.MsgSend]: 'Send',
    [MsgType.MsgMultiSend]: 'Multi Send',
    [MsgType.MsgBankUpdateParams]: 'Update Bank Params',

    // Cosmos Distribution
    [MsgType.MsgFundCommunityPool]: 'Fund Community Pool',
    [MsgType.MsgSetWithdrawAddress]: 'Set Withdraw Address',
    [MsgType.MsgWithdrawDelegatorReward]: 'Withdraw Delegator Reward',
    [MsgType.MsgDistributionUpdateParams]: 'Update Distribution Params',
    [MsgType.MsgWithdrawValidatorCommission]: 'Withdraw Validator Commission',

    // Cosmos Feegrant
    [MsgType.MsgGrantAllowance]: 'Grant Allowance',
    [MsgType.MsgRevokeAllowance]: 'Revoke Allowance',

    // Cosmos Gov
    [MsgType.MsgVote]: 'Vote',
    [MsgType.MsgVoteV1]: 'Vote V1',
    [MsgType.MsgDepositCosmos]: 'Deposit Cosmos',
    [MsgType.MsgDepositV1]: 'Deposit V1',
    [MsgType.MsgVoteWeighted]: 'Vote Weighted',
    [MsgType.MsgSubmitProposal]: 'Submit Proposal',

    // Cosmos Slashing
    [MsgType.MsgUnjail]: 'Unjail',

    // Cosmos Staking
    [MsgType.MsgDelegate]: 'Delegate',
    [MsgType.MsgUndelegate]: 'Undelegate',
    [MsgType.MsgEditValidator]: 'Edit Validator',
    [MsgType.MsgBeginRedelegate]: 'Begin Redelegate',
    [MsgType.MsgCreateValidator]: 'Create Validator',
    [MsgType.MsgTransferDelegation]: 'Transfer Delegation',
    [MsgType.MsgStakingUpdateParams]: 'Update Staking Params',
    [MsgType.MsgCancelUnbondingDelegation]: 'Cancel Unbonding Delegation',

    // CosmWasm
    [MsgType.MsgStoreCode]: 'Store Code',
    [MsgType.MsgUpdateAdmin]: 'Update Admin',
    [MsgType.MsgExecuteContract]: 'Execute Contract',
    [MsgType.MsgMigrateContract]: 'Migrate Contract',
    [MsgType.MsgInstantiateContract]: 'Instantiate Contract',
    [MsgType.MsgInstantiateContract2]: 'Instantiate Contract2',

    // IBC Transfer
    [MsgType.MsgTransfer]: 'Transfer',

    // IBC Channel
    [MsgType.MsgTimeout]: 'Timeout',
    [MsgType.MsgRecvPacket]: 'Recv Packet',
    [MsgType.MsgChannelOpenAck]: 'Channel Open Ack',
    [MsgType.MsgChannelOpenTry]: 'Channel Open Try',
    [MsgType.MsgAcknowledgement]: 'Acknowledgement',
    [MsgType.MsgChannelOpenInit]: 'Channel Open Init',
    [MsgType.MsgChannelOpenConfirm]: 'Channel Open Confirm',

    // IBC Client
    [MsgType.MsgCreateClient]: 'Create Client',
    [MsgType.MsgUpdateClient]: 'Update Client',

    // IBC Connection
    [MsgType.MsgConnectionOpenAck]: 'Connection Open Ack',
    [MsgType.MsgConnectionOpenTry]: 'Connection Open Try',
    [MsgType.MsgConnectionOpenInit]: 'Connection Open Init',
    [MsgType.MsgConnectionOpenConfirm]: 'Connection Open Confirm',

    // Injective Auction
    [MsgType.MsgBid]: 'Bid',
    [MsgType.MsgAuctionUpdateParams]: 'Update Auction Params',

    // Injective ERC20
    [MsgType.MsgCreateTokenPair]: 'Create Token Pair',
    [MsgType.MsgDeleteTokenPair]: 'Delete Token Pair',
    [MsgType.MsgErc20UpdateParams]: 'Update ERC20 Params',

    // Injective EVM
    [MsgType.LegacyTx]: 'Legacy Tx',
    [MsgType.AccessListTx]: 'Access List Tx',
    [MsgType.DynamicFeeTx]: 'Dynamic Fee Tx',
    [MsgType.MsgEthereumTx]: 'Ethereum Tx',
    [MsgType.MsgEvmUpdateParams]: 'Update EVM Params',
    [MsgType.ExtensionOptionsEthereumTx]: 'Extension Options Ethereum Tx',

    // Injective Exchange V1Beta1 - Core
    [MsgType.MsgDeposit]: 'Deposit',
    [MsgType.MsgSignDoc]: 'Sign Doc',
    [MsgType.MsgSignData]: 'Sign Data',
    [MsgType.MsgWithdraw]: 'Withdraw',
    [MsgType.MsgRewardsOptOut]: 'Rewards Opt Out',
    [MsgType.MsgExternalTransfer]: 'External Transfer',
    [MsgType.MsgLiquidatePosition]: 'Liquidate Position',
    [MsgType.MsgBatchUpdateOrders]: 'Batch Update Orders',
    [MsgType.MsgSubaccountTransfer]: 'Subaccount Transfer',
    [MsgType.MsgActivateStakeGrant]: 'Activate Stake Grant',
    [MsgType.MsgReclaimLockedFunds]: 'Reclaim Locked Funds',
    [MsgType.MsgExchangeUpdateParams]: 'Update Exchange Params',
    [MsgType.MsgAuthorizeStakeGrants]: 'Authorize Stake Grants',
    [MsgType.MsgPrivilegedExecuteContract]: 'Execute Contract',

    // Injective Exchange V1Beta1 - Spot Markets
    [MsgType.MsgCancelSpotOrder]: 'Cancel Spot Order',
    [MsgType.MsgUpdateSpotMarket]: 'Update Spot Market',
    [MsgType.MsgCreateSpotLimitOrder]: 'Create Spot Limit Order',
    [MsgType.MsgBatchCancelSpotOrders]: 'Batch Cancel Spot Orders',
    [MsgType.MsgCreateSpotMarketOrder]: 'Create Spot Market Order',
    [MsgType.MsgInstantSpotMarketLaunch]: 'Instant Spot Market Launch',
    [MsgType.MsgBatchCreateSpotLimitOrders]: 'Batch Create Spot Limit Orders',

    // Injective Exchange V1Beta1 - Derivative Markets
    [MsgType.MsgBatchCreateDerivativeLimitOrders]:
      'Batch Create Derivative Limit Orders',
    [MsgType.MsgCancelDerivativeOrder]: 'Cancel Derivative Order',
    [MsgType.MsgEmergencySettleMarket]: 'Emergency Settle Market',
    [MsgType.MsgIncreasePositionMargin]: 'Increase Position Margin',
    [MsgType.MsgDecreasePositionMargin]: 'Decrease Position Margin',
    [MsgType.MsgUpdateDerivativeMarket]: 'Update Derivative Market',
    [MsgType.MsgCreateDerivativeLimitOrder]: 'Create Derivative Limit Order',
    [MsgType.MsgBatchCancelDerivativeOrders]: 'Batch Cancel Derivative Orders',
    [MsgType.MsgCreateDerivativeMarketOrder]: 'Create Derivative Market Order',

    // Injective Exchange V1Beta1 - Binary Options
    [MsgType.MsgCreateBinaryOptionsLimitOrder]:
    'Create Binary Options Limit Order',
    [MsgType.MsgBatchCancelBinaryOptionsOrders]:
    'Batch Cancel Binary Options Orders',
    [MsgType.MsgCreateBinaryOptionsMarketOrder]:
    'Create Binary Options Market Order',
    [MsgType.MsgAdminUpdateBinaryOptionsMarket]:
    'Admin Update Binary Options Market',
    [MsgType.MsgInstantBinaryOptionsMarketLaunch]:
    'Instant Binary Options Market Launch',
    [MsgType.MsgCancelBinaryOptionsOrder]: 'Cancel Binary Options Order',

    // Injective Exchange V1Beta1 - Order Data & Results
    [MsgType.OrderData]: 'Order Data',
    [MsgType.SpotMarketOrderResults]: 'Spot Market Order Results',
    [MsgType.MsgBatchExchangeModification]: 'Batch Exchange Modification',
    [MsgType.DerivativeMarketOrderResults]: 'Derivative Market Order Results',

    // Injective Exchange V1Beta1 - Proposals
    [MsgType.MsgFeeDiscountProposal]: 'Fee Discount Proposal',
    [MsgType.MsgSpotMarketLaunchProposal]: 'Spot Market Launch Proposal',
    [MsgType.MsgUpdateDenomDecimalsProposal]: 'Update Denom Decimals Proposal',
    [MsgType.MsgPerpetualMarketLaunchProposal]: 'Perpetual Market Launch Proposal',
    [MsgType.MsgSpotMarketParamUpdateProposal]: 'Spot Market Param Update Proposal',
    [MsgType.MsgMarketForcedSettlementProposal]: 'Market Forced Settlement Proposal',
    [MsgType.MsgBatchCommunityPoolSpendProposal]: 'Batch Community Pool Spend Proposal',
    [MsgType.MsgBatchExchangeModificationProposal]: 'Batch Exchange Modification Proposal',
    [MsgType.MsgExpiryFuturesMarketLaunchProposal]: 'Expiry Futures Market Launch Proposal',
    [MsgType.MsgBinaryOptionsMarketLaunchProposal]: 'Binary Options Market Launch Proposal',
    [MsgType.MsgDerivativeMarketParamUpdateProposal]: 'Derivative Market Param Update Proposal',
    [MsgType.MsgTradingRewardCampaignLaunchProposal]: 'Trading Reward Campaign Launch Proposal',
    [MsgType.MsgTradingRewardCampaignUpdateProposal]: 'Trading Reward Campaign Update Proposal',
    [MsgType.MsgBinaryOptionsMarketParamUpdateProposal]: 'Binary Options Market Param Update Proposal',
    [MsgType.MsgTradingRewardPendingPointsUpdateProposal]: 'Trading Reward Pending Points Update Proposal',

    // Injective Exchange V1Beta1 - Authz
    [MsgType.MsgCancelSpotOrderAuthz]: 'Cancel Spot Order Authz',
    [MsgType.MsgBatchUpdateOrdersAuthz]: 'Batch Update Orders Authz',
    [MsgType.MsgCreateSpotLimitOrderAuthz]: 'Create Spot Limit Order Authz',
    [MsgType.MsgCancelDerivativeOrderAuthz]: 'Cancel Derivative Order Authz',
    [MsgType.MsgCreateSpotMarketOrderAuthz]: 'Create Spot Market Order Authz',
    [MsgType.MsgBatchCancelSpotOrdersAuthz]: 'Batch Cancel Spot Orders Authz',
    [MsgType.MsgCreateDerivativeLimitOrderAuthz]: 'Create Derivative Limit Order Authz',
    [MsgType.MsgBatchCreateSpotLimitOrdersAuthz]: 'Batch Create Spot Limit Orders Authz',
    [MsgType.MsgCreateDerivativeMarketOrderAuthz]: 'Create Derivative Market Order Authz',
    [MsgType.MsgBatchCancelDerivativeOrdersAuthz]: 'Batch Cancel Derivative Orders Authz',
    [MsgType.MsgBatchCreateDerivativeLimitOrdersAuthz]: 'Batch Create Derivative Limit Orders Authz',

    // Injective Exchange V2 - Core
    [MsgType.MsgDepositV2]: 'Deposit V2',
    [MsgType.MsgSignDocV2]: 'Sign Doc V2',
    [MsgType.OrderDataV2]: 'Order Data V2',
    [MsgType.MsgWithdrawV2]: 'Withdraw V2',
    [MsgType.MsgSignDataV2]: 'Sign Data V2',
    [MsgType.MsgFeeDiscountV2]: 'Fee Discount V2',
    [MsgType.MsgUpdateParamsV2]: 'Update Params V2',
    [MsgType.MsgRewardsOptOutV2]: 'Rewards Opt Out V2',
    [MsgType.MsgExchangeEnableV2]: 'Exchange Enable V2',
    [MsgType.MsgExternalTransferV2]: 'External Transfer V2',
    [MsgType.MsgBatchUpdateOrdersV2]: 'Batch Update Orders V2',
    [MsgType.MsgSubaccountTransferV2]: 'Subaccount Transfer V2',
    [MsgType.MsgActivateStakeGrantV2]: 'Activate Stake Grant V2',
    [MsgType.MsgReclaimLockedFundsV2]: 'Reclaim Locked Funds V2',
    [MsgType.MsgAuthorizeStakeGrantsV2]: 'Authorize Stake Grants V2',
    [MsgType.MsgBatchExchangeModificationV2]: 'Batch Exchange Modification V2',
    [MsgType.MsgPrivilegedExecuteContractV2]: 'Privileged Execute Contract V2',
    [MsgType.MsgSetDelegationTransferReceivers]: 'Set Delegation Transfer Receivers',

    // Injective Exchange V2 - Spot Markets
    [MsgType.MsgCancelSpotOrderV2]: 'Cancel Spot Order V2',
    [MsgType.MsgSpotMarketLaunchV2]: 'Spot Market Launch V2',
    [MsgType.MsgUpdateSpotMarketV2]: 'Update Spot Market V2',
    [MsgType.MsgCreateSpotLimitOrderV2]: 'Create Spot Limit Order V2',
    [MsgType.SpotMarketOrderResultsV2]: 'Spot Market Order Results V2',
    [MsgType.MsgCreateSpotMarketOrderV2]: 'Create Spot Market Order V2',
    [MsgType.MsgBatchCancelSpotOrdersV2]: 'Batch Cancel Spot Orders V2',
    [MsgType.MsgSpotMarketParamUpdateV2]: 'Spot Market Param Update V2',
    [MsgType.MsgInstantSpotMarketLaunchV2]: 'Instant Spot Market Launch V2',
    [MsgType.MsgBatchCreateSpotLimitOrdersV2]: 'Batch Create Spot Limit Orders V2',

    // Injective Exchange V2 - Derivative Markets
    [MsgType.MsgCancelDerivativeOrderV2]: 'Cancel Derivative Order V2',
    [MsgType.MsgPerpetualMarketLaunchV2]: 'Perpetual Market Launch V2',
    [MsgType.MsgUpdateDerivativeMarketV2]: 'Update Derivative Market V2',
    [MsgType.MsgExpiryFuturesMarketLaunchV2]: 'Expiry Futures Market Launch V2',
    [MsgType.MsgCreateDerivativeLimitOrderV2]: 'Create Derivative Limit Order V2',
    [MsgType.DerivativeMarketOrderResultsV2]: 'Derivative Market Order Results V2',
    [MsgType.MsgCreateDerivativeMarketOrderV2]: 'Create Derivative Market Order V2',
    [MsgType.MsgBatchCancelDerivativeOrdersV2]: 'Batch Cancel Derivative Orders V2',
    [MsgType.MsgDerivativeMarketParamUpdateV2]: 'Derivative Market Param Update V2',
    [MsgType.MsgInstantPerpetualMarketLaunchV2]: 'Instant Perpetual Market Launch V2',
    [MsgType.MsgBatchCreateDerivativeLimitOrdersV2]: 'Batch Create Derivative Limit Orders V2',
    [MsgType.MsgInstantExpiryFuturesMarketLaunchV2]: 'Instant Expiry Futures Market Launch V2',

    // Injective Exchange V2 - Binary Options
    [MsgType.MsgCancelBinaryOptionsOrderV2]: 'Cancel Binary Options Order V2',
    [MsgType.MsgBinaryOptionsMarketLaunchV2]: 'Binary Options Market Launch V2',
    [MsgType.MsgCreateBinaryOptionsLimitOrderV2]: 'Create Binary Options Limit Order V2',
    [MsgType.MsgCreateBinaryOptionsMarketOrderV2]: 'Create Binary Options Market Order V2',
    [MsgType.MsgBatchCancelBinaryOptionsOrdersV2]: 'Batch Cancel Binary Options Orders V2',
    [MsgType.MsgBinaryOptionsMarketParamUpdateV2]: 'Binary Options Market Param Update V2',
    [MsgType.MsgAdminUpdateBinaryOptionsMarketV2]: 'Admin Update Binary Options Market V2',
    [MsgType.MsgInstantBinaryOptionsMarketLaunchV2]: 'Instant Binary Options Market Launch V2',

    // Injective Exchange V2 - Position & Liquidation
    [MsgType.MsgLiquidatePositionV2]: 'Liquidate Position V2',
    [MsgType.MsgCancelPostOnlyModeV2]: 'Cancel Post Only Mode V2',
    [MsgType.MsgEmergencySettleMarketV2]: 'Emergency Settle Market V2',
    [MsgType.MsgIncreasePositionMarginV2]: 'Increase Position Margin V2',
    [MsgType.MsgDecreasePositionMarginV2]: 'Decrease Position Margin V2',
    [MsgType.MsgMarketForcedSettlementV2]: 'Market Forced Settlement V2',

    // Injective Exchange V2 - Trading Rewards & Community
    [MsgType.MsgBatchCommunityPoolSpendV2]: 'Batch Community Pool Spend V2',
    [MsgType.MsgTradingRewardCampaignLaunchV2]: 'Trading Reward Campaign Launch V2',
    [MsgType.MsgTradingRewardCampaignUpdateV2]: 'Trading Reward Campaign Update V2',
    [MsgType.MsgTradingRewardPendingPointsUpdateV2]: 'Trading Reward Pending Points Update V2',
    [MsgType.MsgAtomicMarketOrderFeeMultiplierScheduleV2]: 'Atomic Market Order Fee Multiplier Schedule V2',

    // Injective Insurance
    [MsgType.MsgUnderwrite]: 'Underwrite',
    [MsgType.MsgRequestRedemption]: 'Request Redemption',
    [MsgType.MsgCreateInsuranceFund]: 'Create Insurance Fund',
    [MsgType.MsgInsuranceUpdateParams]: 'Update Insurance Params',

    // Injective Oracle
    [MsgType.MsgRelayBandRates]: 'Relay Band Rates',
    [MsgType.MsgRelayPythPrices]: 'Relay Pyth Prices',
    [MsgType.MsgRelayStorkPrices]: 'Relay Stork Prices',
    [MsgType.MsgOracleUpdateParams]: 'Update Oracle Params',
    [MsgType.MsgRelayProviderPrices]: 'Relay Provider Prices',
    [MsgType.MsgRelayPriceFeedPrice]: 'Relay Price Feed Price',
    [MsgType.MsgRequestBandIBCRates]: 'Request Band IBC Rates',
    [MsgType.MsgRelayCoinbaseMessages]: 'Relay Coinbase Messages',

    // Injective OCR
    [MsgType.MsgTransmit]: 'Transmit',
    [MsgType.MsgSetPayees]: 'Set Payees',
    [MsgType.MsgCreateFeed]: 'Create Feed',
    [MsgType.MsgUpdateFeed]: 'Update Feed',
    [MsgType.MsgAcceptPayeeship]: 'Accept Payeeship',
    [MsgType.MsgOcrUpdateParams]: 'Update OCR Params',
    [MsgType.MsgTransferPayeeship]: 'Transfer Payeeship',
    [MsgType.MsgFundFeedRewardPool]: 'Fund Feed Reward Pool',
    [MsgType.MsgWithdrawFeedRewardPool]: 'Withdraw Feed Reward Pool',

    // Injective Peggy
    [MsgType.MsgSendToEth]: 'Send To Eth',
    [MsgType.MsgConfirmBatch]: 'Confirm Batch',
    [MsgType.MsgDepositClaim]: 'Deposit Claim',
    [MsgType.MsgRequestBatch]: 'Request Batch',
    [MsgType.MsgValsetConfirm]: 'Valset Confirm',
    [MsgType.MsgWithdrawClaim]: 'Withdraw Claim',
    [MsgType.MsgCancelSendToEth]: 'Cancel Send To Eth',
    [MsgType.MsgERC20DeployedClaim]: 'Erc20 Deployed Claim',
    [MsgType.MsgValsetUpdatedClaim]: 'Valset Updated Claim',
    [MsgType.MsgRevokeEthereumBlacklist]: 'Revoke Ethereum Blacklist',
    [MsgType.MsgSetOrchestratorAddresses]: 'Set Orchestrator Addresses',
    [MsgType.MsgBlacklistEthereumAddresses]: 'Blacklist Ethereum Addresses',
    [MsgType.MsgSubmitBadSignatureEvidence]: 'Submit Bad Signature Evidence',
    [MsgType.MsgBlacklistEthereumAddressesProposal]: 'Blacklist Ethereum Addresses Proposal',
    [MsgType.MsgRevokeEthereumBlacklistProposal]: 'Revoke Ethereum Blacklist Proposal',

    // Injective Permissions
    [MsgType.MsgClaimVoucher]: 'Claim Voucher',
    [MsgType.MsgCreateNamespace]: 'Create Namespace',
    [MsgType.MsgDeleteNamespace]: 'Delete Namespace',
    [MsgType.MsgUpdateNamespace]: 'Update Namespace',
    [MsgType.MsgUpdateActorRoles]: 'Update Actor Roles',
    [MsgType.MsgUpdateNamespaceRoles]: 'Update Namespace Roles',
    [MsgType.MsgRevokeNamespaceRoles]: 'Revoke Namespace Roles',
    [MsgType.MsgUpdateNamespaceSetContractHook]: 'Update Namespace Set Contract Hook',
    [MsgType.MsgPermissionsUpdateParams]: 'Update Permissions Params',
    [MsgType.MsgSetWasmHook]: 'Set Wasm Hook',
    [MsgType.MsgSetMintsPaused]: 'Set Mints Paused',
    [MsgType.MsgSetSendsPaused]: 'Set Sends Paused',
    [MsgType.MsgSetBurnsPaused]: 'Set Burns Paused',

    // Injective TokenFactory
    [MsgType.MsgBurn]: 'Burn',
    [MsgType.MsgMint]: 'Mint',
    [MsgType.MsgCreateDenom]: 'Create Denom',
    [MsgType.MsgChangeAdmin]: 'Change Admin',
    [MsgType.MsgSetDenomMetadata]: 'Set Denom Metadata',
    [MsgType.MsgTokenFactoryUpdateParams]: 'Update Token Factory Params',
    [MsgType.MsgSetDenomMetadataAdminBurnDisabled]: 'Set Denom Metadata Admin Burn Disabled',

    // Injective Wasmx
    [MsgType.MsgUpdateContract]: 'Update Contract',
    [MsgType.MsgActivateContract]: 'Activate Contract',
    [MsgType.MsgRegisterContract]: 'Register Contract',
    [MsgType.MsgWasmxUpdateParams]: 'Update Wasmx Params',
    [MsgType.MsgDeactivateContract]: 'Deactivate Contract',
    [MsgType.MsgExecuteContractCompat]: 'Execute Contract',
    [MsgType.MsgContractRegistrationRequestProposal]: 'Contract Registration Request Proposal',
    [MsgType.MsgBatchContractRegistrationRequestProposal]: 'Batch Contract Registration Request Proposal',

    // Injective TxFees
    [MsgType.MsgTxFeesUpdateParams]: 'Update Tx Fees Params',

    'injective.exchange.v1beta1.MsgInstantPerpetualMarketLaunch': 'Instant Perpetual Market Launch',
    'injective.exchange.v1beta1.MsgInstantExpiryFuturesMarketLaunch': 'Instant Expiry Futures Market Launch',
  }).map(([k, v]) => [
    k,
    /^[A-Z][a-z]+(?:[A-Z][a-z]+)+$/.test(v)
      ? breakCamelCase(v)
      : v.includes('.') && /^[A-Z]/.test(v.split('.').pop() || '')
        ? breakCamelCase(v.split('.').pop() || '')
        : breakCamelCase(v)
  ])
) as Record<string | MsgType, string>
