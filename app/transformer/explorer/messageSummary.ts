import { MsgType } from '@injectivelabs/ts-types'
import { toHumanReadable } from '@injectivelabs/utils'
import { contractSummaryMap } from './contractSummary'
import { base64ToUtf8 } from '@injectivelabs/sdk-ts/utils'
import { getNetworkFromAddress } from './../../utils/network'
import {
  cancelSpotOrderSummary,
  batchUpdateOrdersSummary,
  createSpotLimitOrderSummary,
  createSpotMarketOrderSummary,
  cancelDerivativeOrderSummary,
  batchCancelSpotOrdersSummary,
  instantSpotMarketLaunchSummary,
  createDerivativeLimitOrderSummary,
  batchCreateSpotLimitOrdersSummary,
  createDerivativeMarketOrderSummary,
  batchCancelDerivativeOrdersSummary,
  batchCreateDerivativeLimitOrdersSummary
} from './utils/exchange'
import type { Coin, Message, EventLog } from '@injectivelabs/sdk-ts'

export type MsgSummaryParams = {
  value: Message
  logs: EventLog[]
  injectiveAddress?: string
}

export type MsgSummaryHandler = (params: MsgSummaryParams) => string[]

const AUCTION_POOL_SUBACCOUNT_ID =
  '0x1111111111111111111111111111111111111111111111111111111111111111'

const exchangeMsgSummaryMap: Partial<Record<MsgType, MsgSummaryHandler>> = {
  [MsgType.MsgWithdraw]: ({ value }) => {
    const {
      sender,
      amount: { denom, amount },
      subaccount_id: subaccountId
    } = value.message

    return [
      `{{account:${sender}}} withdrew {{denom:${denom}-${amount}}} from subaccount {{ellipsis:${subaccountId}}}`
    ]
  },

  [MsgType.MsgInstantSpotMarketLaunch]: instantSpotMarketLaunchSummary,
  [MsgType.MsgInstantSpotMarketLaunchV2]: (params) =>
    instantSpotMarketLaunchSummary({ ...params, isV2: true }),

  [MsgType.MsgCreateSpotMarketOrder]: createSpotMarketOrderSummary,
  [MsgType.MsgCreateSpotMarketOrderV2]: (params) =>
    createSpotMarketOrderSummary({ ...params, isV2: true }),

  [MsgType.MsgCreateSpotLimitOrder]: createSpotLimitOrderSummary,
  [MsgType.MsgCreateSpotLimitOrderV2]: (params) =>
    createSpotLimitOrderSummary({ ...params, isV2: true }),

  [MsgType.MsgCreateDerivativeMarketOrder]: createDerivativeMarketOrderSummary,
  [MsgType.MsgCreateDerivativeMarketOrderV2]: (params) =>
    createDerivativeMarketOrderSummary({ ...params, isV2: true }),

  [MsgType.MsgCreateDerivativeLimitOrder]: createDerivativeLimitOrderSummary,
  [MsgType.MsgCreateDerivativeLimitOrderV2]: (params) =>
    createDerivativeLimitOrderSummary({ ...params, isV2: true }),

  [MsgType.MsgCancelSpotOrder]: cancelSpotOrderSummary,
  [MsgType.MsgCancelSpotOrderV2]: (params) =>
    cancelSpotOrderSummary({ ...params, isV2: true }),

  [MsgType.MsgBatchCancelSpotOrders]: batchCancelSpotOrdersSummary,
  [MsgType.MsgBatchCancelSpotOrdersV2]: (params) =>
    batchCancelSpotOrdersSummary({ ...params, isV2: true }),

  [MsgType.MsgBatchCreateSpotLimitOrders]: batchCreateSpotLimitOrdersSummary,
  [MsgType.MsgBatchCreateSpotLimitOrdersV2]: (params) =>
    batchCreateSpotLimitOrdersSummary({ ...params, isV2: true }),

  [MsgType.MsgCancelDerivativeOrder]: cancelDerivativeOrderSummary,
  [MsgType.MsgCancelDerivativeOrderV2]: (params) =>
    cancelDerivativeOrderSummary({ ...params, isV2: true }),

  [MsgType.MsgBatchCancelDerivativeOrders]: batchCancelDerivativeOrdersSummary,
  [MsgType.MsgBatchCancelDerivativeOrdersV2]: (params) =>
    batchCancelDerivativeOrdersSummary({ ...params, isV2: true }),

  [MsgType.MsgBatchCreateDerivativeLimitOrders]:
    batchCreateDerivativeLimitOrdersSummary,
  [MsgType.MsgBatchCreateDerivativeLimitOrdersV2]: (params) =>
    batchCreateDerivativeLimitOrdersSummary({ ...params, isV2: true }),

  [MsgType.MsgBatchUpdateOrders]: batchUpdateOrdersSummary,
  [MsgType.MsgBatchUpdateOrdersV2]: (params) =>
    batchUpdateOrdersSummary({ ...params, isV2: true }),

  [MsgType.MsgIncreasePositionMargin]: ({ value }) => {
    const { sender, amount, market_id: marketId } = value.message

    return [
      `{{account:${sender}}} increased position margin by {{market-quote:${marketId}-${amount}}} for the {{market:${marketId}}} position`
    ]
  },

  [MsgType.MsgDecreasePositionMargin]: ({ value }) => {
    const {
      sender,
      amount,
      market_id: marketId,
      source_subaccount_id: sourceSubaccountId,
      destination_subaccount_id: destinationSubaccountId
    } = value.message

    return [
      `{{account:${sender}}} decreased position margin by {{market-quote:${marketId}-${amount}}} for the {{market:${marketId}}} from subaccount {{ellipsis:${sourceSubaccountId}}} to subaccount {{ellipsis:${destinationSubaccountId}}}`
    ]
  },

  [MsgType.MsgLiquidatePosition]: ({ value }) => {
    const {
      sender,
      market_id: marketId,
      subaccount_id: subaccountId
    } = value.message

    return [
      `{{account:${sender}}} liquidated a position in {{market:${marketId}}} market that belonged to the subaccount {{ellipsis:${subaccountId}}}`
    ]
  },

  [MsgType.MsgUpdateDerivativeMarketV2]: ({ value }) => {
    const { admin, market_id: marketId, new_ticker: newTicker } = value.message

    return [
      `{{account:${admin}}} updated derivative market {{market:${marketId}}} to ${newTicker}`
    ]
  }
}

const stakingMsgSummaryMap: Partial<Record<MsgType, MsgSummaryHandler>> = {
  [MsgType.MsgDelegate]: ({ value }) => {
    const {
      amount: { denom, amount },
      delegator_address: delegator,
      validator_address: validator
    } = value.message

    return [
      `{{account:${delegator}}} staked {{denom:${denom}-${amount}}} to {{validator:${validator}}}`
    ]
  },

  [MsgType.MsgUnjail]: ({ value }) => {
    const { validator_addr: validatorAddress } = value.message

    return [`{{validator:${validatorAddress}}} sent an unjail message`]
  },

  [MsgType.MsgCreateValidator]: ({ value }) => {
    const {
      description: { moniker },
      validator_address: validatorAddress
    } = value.message

    return [
      `Validator ${moniker} has been created with the address {{account:${validatorAddress}}}`
    ]
  },

  [MsgType.MsgEditValidator]: ({ value }) => {
    const {
      description: { moniker },
      validator_address: validatorAddress
    } = value.message

    return [
      `{{validator:${validatorAddress}}} modified ${moniker} validator details`
    ]
  },

  [MsgType.MsgBeginRedelegate]: ({ value }) => {
    const {
      amount: { denom, amount },
      delegator_address: delegator,
      validator_src_address: validatorSrc,
      validator_dst_address: validatorDst
    } = value.message

    return [
      `{{account:${delegator}}} redelegated {{denom:${denom}-${amount}}} from {{validator:${validatorSrc}}} to {{validator:${validatorDst}}}`
    ]
  },

  [MsgType.MsgWithdrawDelegatorReward]: ({ value }) => {
    const {
      delegator_address: delegatorAddress,
      validator_address: validatorAddress
    } = value.message

    return [
      `{{account:${delegatorAddress}}} claimed rewards from {{validator:${validatorAddress}}}`
    ]
  },

  [MsgType.MsgUndelegate]: ({ value }) => {
    const {
      amount: { denom, amount },
      delegator_address: delegator,
      validator_address: validator
    } = value.message

    return [
      `{{account:${delegator}}} unstaked {{denom:${denom}-${amount}}} from {{validator:${validator}}}`
    ]
  }
}

const insuranceMsgSummaryMap: Partial<Record<MsgType, MsgSummaryHandler>> = {
  [MsgType.MsgCreateInsuranceFund]: ({ value }) => {
    const {
      sender,
      ticker,
      initial_deposit: { amount, denom }
    } = value.message

    return [
      `{{account:${sender}}} created an insurance fund with an initial deposit of {{denom:${denom}-${amount}}} for the ${ticker} market`
    ]
  },

  [MsgType.MsgRequestRedemption]: ({ value }) => {
    const {
      sender,
      market_id: marketId,
      amount: { amount, denom }
    } = value.message

    return [
      `{{account:${sender}}} requested a redemption of ${toHumanReadable(
        amount,
        18
      ).toFixed()} ${denom} from the {{market:${marketId}}} Insurance Fund`
    ]
  },

  [MsgType.MsgUnderwrite]: ({ value }) => {
    const {
      sender,
      market_id: marketId,
      deposit: { amount, denom }
    } = value.message

    return [
      `{{account:${sender}}} underwrote {{denom:${denom}-${amount}}} in {{market:${marketId}}} insurance fund`
    ]
  }
}

const peggyMsgSummaryMap: Partial<Record<MsgType, MsgSummaryHandler>> = {
  [MsgType.MsgConfirmBatch]: ({ value }) => {
    const { orchestrator } = value.message

    return [`${orchestrator} confirmed a batch request`]
  },

  [MsgType.MsgRequestBatch]: ({ value }) => {
    const { orchestrator } = value.message

    return [`${orchestrator} sent a batch request`]
  },

  [MsgType.MsgValsetConfirm]: ({ value }) => {
    const { orchestrator } = value.message

    return [`${orchestrator} confirmed the Valset`]
  },

  [MsgType.MsgSetOrchestratorAddresses]: ({ value }) => {
    const { sender, orchestrator } = value.message

    return [
      `{{account:${sender}}} set the orchestrator address to {{account:${orchestrator}}}`
    ]
  },

  [MsgType.MsgSendToEth]: ({ value }) => {
    const { amount, sender, eth_dest: receiver } = value.message

    return [
      `{{account:${sender}}} withdrew {{denom:${amount.denom}-${amount.amount}}} to {{externalAccount:${receiver}}} on Ethereum`
    ]
  }
}

const voteSummary: MsgSummaryHandler = ({ value }) => {
  const { voter, option: optionRaw, proposal_id: proposalId } = value.message

  let option = 'noWithVeto'

  if (optionRaw === 'VOTE_OPTION_YES') {
    option = 'yes'
  }

  if (optionRaw === 'VOTE_OPTION_ABSTAIN') {
    option = 'abstain'
  }

  if (optionRaw === 'VOTE_OPTION_NO') {
    option = 'no'
  }

  return [`{{account:${voter}}} voted ${option} for {{proposal:${proposalId}}}`]
}

const govMsgSummaryMap: Partial<Record<string | MsgType, MsgSummaryHandler>> = {
  [MsgType.MsgDepositCosmos]: ({ value }) => {
    const { amount, depositor, proposal_id: proposalId } = value.message

    const [coin] = amount

    return [
      `{{account:${depositor}}} deposited {{denom:${coin.denom}-${coin.amount}}} to proposal {{proposal:${proposalId}}}`
    ]
  },

  'cosmos.gov.v1.MsgVote': voteSummary,
  [MsgType.MsgVote]: voteSummary,

  [MsgType.MsgSubmitProposal]: ({ value }) => {
    const { proposer, initial_deposit: amount } = value.message

    const [coin] = amount

    return [
      `{{account:${proposer}}} submitted a proposal with an initial deposit of {{denom:${coin.denom}-${coin.amount}}}`
    ]
  }
}

const executeContractSummary: MsgSummaryHandler = ({ value, logs }) => {
  const { sender, contract: contractAddress, msg, funds } = value.message

  const summaryFn = contractSummaryMap[contractAddress]

  if (!summaryFn) {
    return []
  }

  // logs are forwarded so swap summaries can use actual amounts from events;
  // RFQ summaries ignore logs and parse from the message body directly
  const contractSummary = summaryFn({ sender, msg, funds, logs })

  return contractSummary ? [contractSummary] : []
}

const msgSummaryMap: Partial<Record<MsgType, MsgSummaryHandler>> = {
  ...govMsgSummaryMap,
  ...peggyMsgSummaryMap,
  ...stakingMsgSummaryMap,
  ...exchangeMsgSummaryMap,
  ...insuranceMsgSummaryMap,

  [MsgType.MsgSend]: ({ value, injectiveAddress }) => {
    const { amount, from_address: sender, to_address: receiver } = value.message
    const [coin] = amount as { denom: string; amount: string }[]

    if (!coin) {
      return []
    }

    if (!injectiveAddress) {
      return [
        `{{account:${sender}}} sent {{denom:${coin.denom}-${coin.amount}}} to {{account:${receiver}}}`
      ]
    }

    return [
      injectiveAddress === sender
        ? `Sent {{denom:${coin.denom}-${coin.amount}}} to {{account:${receiver}}}`
        : `Received {{denom:${coin.denom}-${coin.amount}}} from {{account:${sender}}}`
    ]
  },

  [MsgType.MsgMultiSend]: ({ value }) => {
    const { inputs, outputs } = value.message

    return [
      ...inputs.map(
        (sender: { coins: Coin[]; address: string }) =>
          `{{account:${sender.address}}} ${sender.coins
            .map(({ denom, amount }) => `sent {{denom:${denom}-${amount}}}`)
            .join(', ')}`
      ),
      ...outputs.map(
        (sender: { coins: Coin[]; address: string }) =>
          `{{account:${sender.address}}} ${sender.coins
            .map(({ denom, amount }) => `received {{denom:${denom}-${amount}}}`)
            .join(', ')}`
      )
    ]
  },

  [MsgType.MsgRecvPacket]: ({ value }) => {
    const { packet } = value.message
    const decodedPacketData = JSON.parse(base64ToUtf8(packet.data))

    const { amount, denom, sender, receiver } = decodedPacketData

    if (!amount && !denom && !sender && !receiver) {
      return []
    }

    const injNetworkDenom = denom.split('/').pop()

    return [
      `{{externalAccount:${sender}}} deposited {{denom:${injNetworkDenom}-${amount}}} to {{account:${receiver}}} from ${getNetworkFromAddress(
        sender
      )}`
    ]
  },

  [MsgType.MsgExternalTransfer]: ({ value }) => {
    const {
      sender,
      amount: { denom, amount },
      source_subaccount_id: sourceSubaccountId,
      destination_subaccount_id: destinationSubaccountId
    } = value.message

    const suffix =
      destinationSubaccountId === AUCTION_POOL_SUBACCOUNT_ID
        ? ' as a contribution to the next auction pool'
        : ''

    return [
      `{{account:${sender}}} transferred {{denom:${denom}-${amount}}} from {{ellipsis:${sourceSubaccountId}}} to subaccount {{ellipsis:${destinationSubaccountId}}}${suffix}`
    ]
  },

  [MsgType.MsgDeposit]: ({ value }) => {
    const {
      amount: { amount, denom },
      subaccount_id: subaccount,
      sender
    } = value.message

    return [
      `{{account:${sender}}} deposited {{denom:${denom}-${amount}}} to subaccount {{ellipsis:${subaccount}}}`
    ]
  },

  [MsgType.MsgDepositClaim]: ({ value }) => {
    const {
      amount,
      token_contract: denom,
      ethereum_sender: sender,
      cosmos_receiver: receiver
    } = value.message

    return [
      `{{externalAccount:${sender}}} deposited {{denom:${denom}-${amount}}} to {{account:${receiver}}} on Injective`
    ]
  },

  [MsgType.MsgExec]: ({ value, logs }) => {
    const execMsgs = (value.message as any).msgs.map((msg: any) => ({
      type: msg['@type'],
      message: msg
    })) as Message[]

    return execMsgs
      .map((msg) => getHumanReadableMessage({ value: msg, logs }))
      .flat()
  },

  [MsgType.MsgBid]: ({ value }) => {
    const {
      sender,
      round,
      bid_amount: { denom, amount }
    } = value.message

    return [
      `{{account:${sender}}} submitted a bid of {{denom:${denom}-${amount}}} in round ${round}`
    ]
  },

  [MsgType.MsgTransfer]: ({ value }) => {
    const {
      sender,
      receiver: toAddress,
      token: { denom, amount }
    } = value.message

    return [
      `{{account:${sender}}} withdrew {{denom:${denom}-${amount}}} to {{account:${toAddress}}} from {{network:${getNetworkFromAddress(
        sender
      )}}}`
    ]
  },

  [MsgType.MsgSubaccountTransfer]: ({ value }) => {
    const {
      sender,
      amount: { denom, amount },
      source_subaccount_id: sourceSubaccountId,
      destination_subaccount_id: destinationSubaccountId
    } = value.message

    return [
      `{{account:${sender}}} transferred {{denom:${denom}-${amount}}} from subaccount {{ellipsis:${sourceSubaccountId}}} to subaccount {{ellipsis:${destinationSubaccountId}}}`
    ]
  },

  [MsgType.MsgExecuteContract]: executeContractSummary,
  [MsgType.MsgExecuteContractCompat]: executeContractSummary
}

export const getHumanReadableMessage = ({
  logs,
  value,
  injectiveAddress
}: {
  value: Message
  logs: EventLog[]
  injectiveAddress?: string
}): string[] => {
  const { type } = value

  const msgType = (type.startsWith('/') ? type.slice(1) : type) as MsgType

  if (msgSummaryMap[msgType]) {
    return msgSummaryMap[msgType]({ value, logs, injectiveAddress })
  }

  return []
}

// todo:
// /ibc.core.channel.v1.MsgTimeout
