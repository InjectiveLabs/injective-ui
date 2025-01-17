import { type Message } from '@injectivelabs/sdk-ts'
import { MsgType } from '@injectivelabs/ts-types'
import { getNetworkFromAddress } from './../../utils/network'

const exchangeMsgSummaryMap: Partial<
  Record<MsgType, (value: Message) => string[]>
> = {
  [MsgType.MsgCreateSpotMarketOrder]: (value: Message) => {
    const { sender, order } = value.message

    const { quantity, price } = order.order_info

    const { market_id: marketId } = order

    return [
      `{{account:${sender}}} created a MARKET ${order.order_type} order for {{spotQuantity:${marketId}-${quantity}}} at {{spotPrice:${marketId}-${price}}} in the {{market:${marketId}}} Spot Market`
    ]
  },

  [MsgType.MsgCreateSpotLimitOrder]: (value: Message) => {
    const { sender, order } = value.message

    const { quantity, price } = order.order_info

    const { market_id: marketId } = order

    return [
      `{{account:${sender}}} created a LIMIT ${order.order_type} order for {{spotQuantity:${marketId}-${quantity}}} at {{spotPrice:${marketId}-${price}}} in the {{market:${marketId}}} Spot Market`
    ]
  },

  [MsgType.MsgCreateDerivativeMarketOrder]: (value: Message) => {
    const { sender, order } = value.message

    const { quantity, price } = order.order_info

    const { market_id: marketId } = order

    return [
      `{{account:${sender}}} created a MARKET ${order.order_type} order for {{derivativeQuantity:${marketId}-${quantity}}} at {{derivativePrice:${marketId}-${price}}} in the {{market:${marketId}}} Derivative Market`
    ]
  },

  [MsgType.MsgCreateDerivativeLimitOrder]: (value: Message) => {
    const { sender, order } = value.message

    const { quantity, price } = order.order_info

    const { market_id: marketId } = order

    return [
      `{{account:${sender}}} created a LIMIT ${order.order_type} order for {{derivativeQuantity:${marketId}-${quantity}}} at {{derivativePrice:${marketId}-${price}}} in the {{market:${marketId}}} Derivative Market`
    ]
  },

  [MsgType.MsgCancelSpotOrder]: (value: Message) => {
    const {
      sender,
      cid,
      order_hash: orderHash,
      market_id: marketId
    } = value.message

    return [
      `{{account:${sender}}} cancelled order ${
        cid || orderHash
      } in the {{market:${marketId}}} Spot Market`
    ]
  },

  [MsgType.MsgBatchCancelSpotOrders]: (value: Message) => {
    const { sender, data: orders } = value.message

    return [
      `{{account:${sender}}} cancelled all spot orders in:`,
      ...orders.map(
        (order: any) =>
          `• {{market:${order.market_id}}} with the following order hash: ${order.order_hash}`
      )
    ]
  },

  [MsgType.MsgBatchCreateSpotLimitOrders]: (value: Message) => {
    const { sender, orders } = value.message

    return [
      `{{account:${sender}}} created a batch of spot limit orders:`,
      ...orders.map(
        (order: any) =>
          `• {{spotQuantity:${order.market_id}-${order.order_info.quantity}}} at {{spotPrice:${order.market_id}-${order.order_info.price}}} in the {{market:${order.market_id}}} Spot Market`
      )
    ]
  },

  [MsgType.MsgCancelDerivativeOrder]: (value: Message) => {
    const {
      sender,
      cid,
      order_hash: orderHash,
      market_id: marketId
    } = value.message

    return [
      `{{account:${sender}}} cancelled order ${
        cid || orderHash
      } in the {{market:${marketId}}} Derivative Market`
    ]
  },

  [MsgType.MsgBatchCancelDerivativeOrders]: (value: Message) => {
    const { sender, orders } = value.message

    return [
      `{{account:${sender}}} cancelled all derivative orders in:`,
      ...orders.map(
        (order: any) =>
          `• {{market:${order.marketId}}} with the following order hash: ${order.orderHash}`
      )
    ]
  },

  [MsgType.MsgBatchCreateDerivativeLimitOrders]: (value: Message) => {
    const { sender, orders } = value.message

    return [
      `{{account:${sender}}} created a batch of derivative limit orders:`,
      ...orders.map(
        (order: any) =>
          `• {{derivativeQuantity:${order.market_id}-${order.order_info.quantity}}} at {{derivativePrice:${order.market_id}-${order.order_info.price}}} in the {{market:${order.market_id}}} Derivative Market`
      )
    ]
  },

  [MsgType.MsgBatchUpdateOrders]: (value: Message) => {
    const {
      sender,
      spot_orders_to_cancel: spotOrdersToCancel,
      spot_orders_to_create: spotOrdersToCreate,
      derivative_orders_to_cancel: derivativeOrdersToCancel,
      derivative_orders_to_create: derivativeOrdersToCreate
    } = value.message as Record<string, any>

    // Not Used:
    // binary_options_orders_to_cancel
    // binary_options_market_ids_to_cancel_all
    // binary_options_orders_to_create

    // derivative_market_ids_to_cancel_all
    // spot_market_ids_to_cancel_all

    const derivativeOrders = derivativeOrdersToCreate.map((order: any) => {
      const { quantity, price } = order.order_info
      const { market_id: marketId } = order

      return `{{account:${sender}}} created a LIMIT ${order.order_type} order for {{derivativeQuantity:${marketId}-${quantity}}} at {{derivativePrice:${marketId}-${price}}} in the {{market:${marketId}}} Derivative Market`
    })

    const spotOrders = spotOrdersToCreate.map((order: any) => {
      const { quantity, price } = order.order_info
      const { market_id: marketId } = order

      return `{{account:${sender}}} created a LIMIT ${order.order_type} order for {{spotQuantity:${marketId}-${quantity}}} at {{spotPrice:${marketId}-${price}}} in the {{market:${marketId}}} Spot Market`
    })

    const spotCancelOrders = spotOrdersToCancel.map((order: any) => {
      const { cid, order_hash: orderHash, market_id: marketId } = order

      return `{{account:${sender}}} cancelled order  ${
        cid || orderHash
      } in the {{market:${marketId}}} Spot Market`
    })

    const derivativeCancelOrders = derivativeOrdersToCancel.map(
      (order: any) => {
        const { cid, order_hash: orderHash, market_id: marketId } = order

        return `{{account:${sender}}} cancelled order ${
          cid || orderHash
        } in the {{market:${marketId}}} Derivative Market`
      }
    )

    return [
      ...derivativeOrders,
      ...spotOrders,
      ...spotCancelOrders,
      ...derivativeCancelOrders
    ]
  }
}

const stakingMsgSummaryMap: Partial<
  Record<MsgType, (value: Message) => string[]>
> = {
  [MsgType.MsgDelegate]: (value: Message) => {
    const {
      amount: { denom, amount },
      delegator_address: delegator,
      validator_address: validator
    } = value.message

    return [
      `{{account:${delegator}}} staked {{denom:${denom}-${amount}}} to {{validator:${validator}}}`
    ]
  },

  [MsgType.MsgBeginRedelegate]: (value: Message) => {
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

  [MsgType.MsgUndelegate]: (value: Message) => {
    const {
      amount: { denom, amount },
      delegator_address: delegator,
      validator_address: validator
    } = value.message

    return [
      `{{account:${delegator}}} undelegated {{denom:${denom}-${amount}}} from {{validator:${validator}}}`
    ]
  },

  [MsgType.MsgWithdrawDelegatorReward]: (value: Message) => {
    const { delegator_address: delegator, validator_address: validator } =
      value.message

    return [
      `{{account:${delegator}}} claimed rewards from {{validator:${validator}}}`
    ]
  }
}

const insuranceMsgSummaryMap: Partial<
  Record<MsgType, (value: Message) => string[]>
> = {
  [MsgType.MsgRequestRedemption]: (value: Message) => {
    const {
      sender,
      market_id: marketId,
      amount: { amount, denom }
    } = value.message

    return [
      `{{account:${sender}}} requested a redemption of {{denom:${denom}-${amount}}} from the {{market:${marketId}}} Insurance Fund`
    ]
  }
}

const msgSummaryMap: Partial<Record<MsgType, (value: Message) => string[]>> = {
  ...stakingMsgSummaryMap,
  ...exchangeMsgSummaryMap,
  ...insuranceMsgSummaryMap,

  [MsgType.MsgSend]: (value: Message) => {
    const { amount, from_address: sender, to_address: receiver } = value.message
    const [coin] = amount as { denom: string; amount: string }[]

    return [
      `{{account:${sender}}} sent {{denom:${coin.denom}-${coin.amount}}} to {{account:${receiver}}}`
    ]
  },

  [MsgType.MsgDeposit]: (value: Message) => {
    const {
      amount: { amount, denom },
      subaccount_id: subaccount,
      sender
    } = value.message

    return [
      `{{account:${sender}}} deposited {{denom:${denom}-${amount}}} to subaccount {{subaccount:${subaccount}}}`
    ]
  },

  [MsgType.MsgDepositClaim]: (value: Message) => {
    const {
      amount,
      token_contract: denom,
      ethereum_sender: sender,
      cosmos_receiver: receiver
    } = value.message

    return [
      `{{cosmosAccount:${sender}}} deposited {{denom:${denom}-${amount}}} to {{account:${receiver}}} on Injective`
    ]
  },

  [MsgType.MsgExec]: (value: Message) => {
    const execMsgs = (value.message as any).msgs.map((msg: any) => ({
      type: msg['@type'],
      message: msg
    })) as Message[]

    return execMsgs.map((msg) => getHumanReadableMessage(msg)).flat()
  },

  [MsgType.MsgBid]: (value: Message) => {
    const { bid_amount: denom, amount, sender, round } = value.message

    return [
      `{{account:${sender}}} submitted a bid of {{denom:${denom}-${amount}}} in round ${round}`
    ]
  },

  [MsgType.MsgTransfer]: (value: Message) => {
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

  [MsgType.MsgSubaccountTransfer]: (value: Message) => {
    const {
      sender,
      amount: { denom, amount },
      source_subaccount_id: sourceSubaccountId,
      destination_subaccount_id: destinationSubaccountId
    } = value.message

    return [
      `{{account:${sender}}} transferred {{denom:${denom}-${amount}}} from subaccount {{subaccount:${sourceSubaccountId}}} to subaccount {{subaccount:${destinationSubaccountId}}}`
    ]
  },

  [MsgType.MsgWithdraw]: (value: Message) => {
    const {
      sender,
      amount: { denom, amount },
      subaccount_id: subaccountId
    } = value.message

    return [
      `{{account:${sender}}} withdrew {{denom:${denom}-${amount}}} from subaccount {{subaccount:${subaccountId}}}`
    ]
  }
}

export const getHumanReadableMessage = (value: Message): string[] => {
  const { type } = value

  const msgType = (type.startsWith('/') ? type.slice(1) : type) as MsgType

  if (msgSummaryMap[msgType]) {
    return msgSummaryMap[msgType](value)
  }

  return []
}
