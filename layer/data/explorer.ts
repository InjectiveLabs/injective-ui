import { MsgType } from '@injectivelabs/ts-types'

export const msgTypeMap = {
  [MsgType.MsgExec]: 'Exec',
  [MsgType.MsgGrant]: 'Grant',
  [MsgType.MsgRevoke]: 'Revoke',
  [MsgType.MsgSend]: 'Send',
  [MsgType.MsgWithdrawDelegatorReward]: 'Withdraw Delegator Reward',
  [MsgType.MsgGrantAllowance]: 'Grant Allowance',
  [MsgType.MsgRevokeAllowance]: 'Revoke Allowance',
  [MsgType.MsgDepositCosmos]: 'Deposit Cosmos',
  [MsgType.MsgSubmitProposal]: 'Submit Proposal',
  [MsgType.MsgVote]: 'Vote',
  'cosmos.gov.v1.MsgVote': 'Vote',
  [MsgType.MsgUnjail]: 'Unjail',
  [MsgType.MsgBeginRedelegate]: 'Begin Redelegate',
  [MsgType.MsgCreateValidator]: 'Create Validator',
  [MsgType.MsgDelegate]: 'Delegate',
  [MsgType.MsgEditValidator]: 'Edit Validator',
  [MsgType.MsgUndelegate]: 'Undelegate',
  [MsgType.MsgCancelUnbondingDelegation]: 'Cancel Unbonding Delegation',
  [MsgType.MsgInstantiateContract]: 'Instantiate Contract',
  [MsgType.MsgInstantiateContract2]: 'Instantiate Contract2',
  [MsgType.MsgMigrateContract]: 'Migrate Contract',
  [MsgType.MsgStoreCode]: 'Store Code',
  [MsgType.MsgUpdateAdmin]: 'Update Admin',
  [MsgType.MsgTransfer]: 'Transfer',
  [MsgType.MsgAcknowledgement]: 'Acknowledgement',
  [MsgType.MsgChannelOpenAck]: 'Channel Open Ack',
  [MsgType.MsgChannelOpenConfirm]: 'Channel Open Confirm',
  [MsgType.MsgChannelOpenInit]: 'Channel Open Init',
  [MsgType.MsgChannelOpenTry]: 'Channel Open Try',
  [MsgType.MsgRecvPacket]: 'Recv Packet',
  [MsgType.MsgTimeout]: 'Timeout',
  [MsgType.MsgCreateClient]: 'Create Client',
  [MsgType.MsgUpdateClient]: 'Update Client',
  [MsgType.MsgConnectionOpenAck]: 'Connection Open Ack',
  [MsgType.MsgConnectionOpenConfirm]: 'Connection Open Confirm',
  [MsgType.MsgConnectionOpenInit]: 'Connection Open Init',
  [MsgType.MsgConnectionOpenTry]: 'Connection Open Try',
  [MsgType.MsgBid]: 'Bid',
  [MsgType.MsgAdminUpdateBinaryOptionsMarket]:
    'Admin Update Binary Options Market',
  [MsgType.MsgBatchCancelDerivativeOrders]: 'Batch Cancel Derivative Orders',
  [MsgType.MsgBatchCancelSpotOrders]: 'Batch Cancel Spot Orders',
  [MsgType.MsgBatchCreateDerivativeLimitOrders]:
    'Batch Create Derivative Limit Orders',
  [MsgType.MsgBatchCreateSpotLimitOrders]: 'Batch Create Spot Limit Orders',
  [MsgType.MsgBatchUpdateOrders]: 'Batch Update Orders',
  [MsgType.MsgCancelBinaryOptionsOrder]: 'Cancel Binary Options Order',
  [MsgType.MsgCancelDerivativeOrder]: 'Cancel Derivative Order',
  [MsgType.MsgCancelSpotOrder]: 'Cancel Spot Order',
  [MsgType.MsgCreateBinaryOptionsLimitOrder]:
    'Create Binary Options Limit Order',
  [MsgType.MsgCreateBinaryOptionsMarketOrder]:
    'Create Binary Options Market Order',
  [MsgType.MsgCreateDerivativeLimitOrder]: 'Create Derivative Limit Order',
  [MsgType.MsgCreateDerivativeMarketOrder]: 'Create Derivative Market Order',
  [MsgType.MsgLiquidatePosition]: 'Liquidate Position',
  [MsgType.MsgCreateSpotLimitOrder]: 'Create Spot Limit Order',
  [MsgType.MsgCreateSpotMarketOrder]: 'Create Spot Market Order',
  [MsgType.MsgDeposit]: 'Deposit',
  [MsgType.MsgExternalTransfer]: 'External Transfer',
  [MsgType.MsgIncreasePositionMargin]: 'Increase Position Margin',
  [MsgType.MsgInstantBinaryOptionsMarketLaunch]:
    'Instant Binary Options Market Launch',
  [MsgType.MsgInstantPerpetualMarketLaunch]: 'Instant Perpetual Market Launch',
  [MsgType.MsgInstantSpotMarketLaunch]: 'Instant Spot Market Launch',
  [MsgType.MsgReclaimLockedFunds]: 'Reclaim Locked Funds',
  [MsgType.MsgRewardsOptOut]: 'Rewards Opt Out',
  [MsgType.MsgSubaccountTransfer]: 'Subaccount Transfer',
  [MsgType.MsgWithdraw]: 'Withdraw',
  [MsgType.MsgCreateInsuranceFund]: 'Create Insurance Fund',
  [MsgType.MsgRequestRedemption]: 'Request Redemption',
  [MsgType.MsgUnderwrite]: 'Underwrite',
  [MsgType.MsgConfirmBatch]: 'Confirm Batch',
  [MsgType.MsgDepositClaim]: 'Deposit Claim',
  [MsgType.MsgERC20DeployedClaim]: 'Erc20 Deployed Claim',
  [MsgType.MsgRequestBatch]: 'Request Batch',
  [MsgType.MsgSendToEth]: 'Send To Eth',
  [MsgType.MsgSetOrchestratorAddresses]: 'Set Orchestrator Addresses',
  [MsgType.MsgValsetConfirm]: 'Valset Confirm',
  [MsgType.MsgValsetUpdatedClaim]: 'Valset Updated Claim',
  [MsgType.MsgWithdrawClaim]: 'Withdraw Claim',
  [MsgType.MsgBurn]: 'Burn',
  [MsgType.MsgMint]: 'Mint',
  [MsgType.MsgCreateDenom]: 'Create Denom',
  [MsgType.MsgExecuteContract]: 'Execute Contract',
  [MsgType.MsgExecuteContractCompat]: 'Execute Contract',
  [MsgType.MsgRelayProviderPrices]: 'Relay Provider Prices',
  [MsgType.MsgMultiSend]: 'Multi Send',
  [MsgType.MsgPrivilegedExecuteContract]: 'Execute Contract',
  'injective.oracle.v1beta1.MsgRelayStorkPrices': 'Relay Stork Prices',
  'injective.exchange.v1beta1.MsgDecreasePositionMargin':
    'Decrease Position Margin',
  'cosmos.distribution.v1beta1.MsgFundCommunityPool': 'Fund Community Pool'
} as Record<string | MsgType, string>
