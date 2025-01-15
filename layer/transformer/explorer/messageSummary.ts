import { type Message } from '@injectivelabs/sdk-ts'
import { MsgType } from '@injectivelabs/ts-types'

const msgSummaryMap: Partial<Record<MsgType, (value: Message) => string[]>> = {
  [MsgType.MsgSend]: (value: Message) => {
    const { amount, from_address: sender, to_address: receiver } = value.message
    const [coin] = amount as { denom: string; amount: string }[]

    return [
      `{{account:${sender}}} sent {{denom:${coin.denom}-${coin.amount}}} to {{account:${receiver}}}`
    ]
  },

  [MsgType.MsgDelegate]: (value: Message) => {
    const {
      amount: { denom, amount },
      delegator_address: delegator,
      validator_address: validator
    } = value.message

    return [
      `{{account:${delegator}}} delegated {{denom:${denom}-${amount}}} to {{validator:${validator}}}`
    ]
  },

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

  [MsgType.MsgExec]: (value: Message) => {
    const execMsgs = (value.message as any).msgs.map((msg: any) => ({
      type: msg['@type'],
      message: msg
    })) as Message[]

    return execMsgs.map((msg) => getHumanReadableMessage(msg)).flat()
  },

  [MsgType.MsgBatchUpdateOrders]: (value: Message) => {
    const {
      spot_orders_to_cancel: spotOrdersToCancel,
      derivative_orders_to_cancel: derivativeOrdersToCancel,
      spot_orders_to_create: spotOrdersToCreate,
      derivative_orders_to_create: derivativeOrdersToCreate,
      sender
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

  [MsgType.MsgDeposit]: (value: Message) => {
    const {
      amount: { denom, amount },
      sender,
      subaccount_id: subaccountId
    } = value.message

    return [
      `{{account:${sender}}} deposited {{denom:${denom}-${amount}}} to subaccount ${subaccountId}`
    ]
  },

  [MsgType.MsgWithdraw]: (value: Message) => {
    const {
      amount: { denom, amount },
      sender,
      subaccount_id: subaccountId
    } = value.message

    return [
      `{{account:${sender}}} withdrew {{denom:${denom}-${amount}}} from subaccount ${subaccountId}`
    ]
  },

  [MsgType.MsgSubaccountTransfer]: (value: Message) => {
    const {
      amount: { denom, amount },
      source_subaccount_id: sourceSubaccountId,
      destination_subaccount_id: destinationSubaccountId,
      sender
    } = value.message

    return [
      `{{account:${sender}}} transferred {{denom:${denom}-${amount}}} from subaccount ${sourceSubaccountId} to subaccount ${destinationSubaccountId}`
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
