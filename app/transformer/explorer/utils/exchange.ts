import { EventMessageType } from '../../../types'
import { eventLogsSummaryMap } from '../messageEvents'
import type { Message, EventLog } from '@injectivelabs/sdk-ts'

export type ExchangeSummaryParams = {
  value: Message
  isV2?: boolean
  logs: EventLog[]
  injectiveAddress?: string
}

export const createSpotMarketOrderSummary = ({
  value
}: ExchangeSummaryParams): string[] => {
  const { sender, order } = value.message

  const { quantity } = order.order_info
  const { market_id: marketId } = order

  return [
    `{{account:${sender}}} created a MARKET ${order.order_type} order for {{spotQuantity:${marketId}-${quantity}}} in {{market:${marketId}}}`
  ]
}

export const createSpotLimitOrderSummary = ({
  value,
  isV2 = false
}: ExchangeSummaryParams): string[] => {
  const { sender, order } = value.message

  const { quantity, price } = order.order_info
  const { market_id: marketId } = order

  const spotPriceToken = isV2 ? 'spotPriceV2' : 'spotPrice'

  return [
    `{{account:${sender}}} created a LIMIT ${order.order_type} order for {{spotQuantity:${marketId}-${quantity}}} at {{${spotPriceToken}:${marketId}-${price}}} in {{market:${marketId}}}`
  ]
}

export const createDerivativeMarketOrderSummary = ({
  value
}: ExchangeSummaryParams): string[] => {
  const { sender, order } = value.message

  const { quantity } = order.order_info
  const { market_id: marketId } = order

  return [
    `{{account:${sender}}} created a MARKET ${order.order_type} order for {{derivativeQuantity:${marketId}-${quantity}}} {{market:${marketId}}}`
  ]
}

export const createDerivativeLimitOrderSummary = ({
  value,
  isV2 = false
}: ExchangeSummaryParams): string[] => {
  const { sender, order } = value.message

  const { quantity, price } = order.order_info
  const { market_id: marketId } = order

  const derivativePriceToken = isV2 ? 'derivativePriceV2' : 'derivativePrice'

  return [
    `{{account:${sender}}} created a LIMIT ${order.order_type} order for {{derivativeQuantity:${marketId}-${quantity}}} at {{${derivativePriceToken}:${marketId}-${price}}} in {{market:${marketId}}}`
  ]
}

export const cancelSpotOrderSummary = ({
  value,
  logs
}: ExchangeSummaryParams): string[] => {
  const {
    cid,
    sender,
    market_id: marketId,
    order_hash: orderHash
  } = value.message

  const eventSummary = eventLogsSummaryMap[EventMessageType.CancelSpotOrder]?.({
    logs,
    sender,
    args: cid || orderHash
  })

  if (eventSummary) {
    return [eventSummary]
  }

  return [
    `{{account:${sender}}} cancelled order {{ellipsis:${
      cid || orderHash
    }}} in {{market:${marketId}}}`
  ]
}

export const cancelDerivativeOrderSummary = ({
  value,
  logs
}: ExchangeSummaryParams): string[] => {
  const {
    cid,
    sender,
    order_hash: orderHash,
    market_id: marketId
  } = value.message

  const eventSummary = eventLogsSummaryMap[
    EventMessageType.CancelDerivativeOrder
  ]?.({
    logs,
    sender,
    args: cid || orderHash
  })

  if (eventSummary) {
    return [eventSummary]
  }

  return [
    `{{account:${sender}}} failed to cancel order {{ellipsis:${
      cid || orderHash
    }}} in {{market:${marketId}}}`
  ]
}

export const instantSpotMarketLaunchSummary = ({
  value
}: ExchangeSummaryParams): string[] => {
  const { sender, ticker } = value.message

  return [`{{account:${sender}}} instant launched the ${ticker}`]
}

export const batchCreateSpotLimitOrdersSummary = ({
  value,
  isV2 = false
}: ExchangeSummaryParams): string[] => {
  const { sender, orders } = value.message

  const spotPriceToken = isV2 ? 'spotPriceV2' : 'spotPrice'

  return [
    `{{account:${sender}}} created a batch of spot limit orders:`,
    ...orders.map(
      (order: any) =>
        `• {{spotQuantity:${order.market_id}-${order.order_info.quantity}}} at {{${spotPriceToken}:${order.market_id}-${order.order_info.price}}} in {{market:${order.market_id}}}`
    )
  ]
}

export const batchCreateDerivativeLimitOrdersSummary = ({
  value,
  isV2 = false
}: ExchangeSummaryParams): string[] => {
  const { sender, orders } = value.message

  const derivativePriceToken = isV2 ? 'derivativePriceV2' : 'derivativePrice'

  return [
    `{{account:${sender}}} created a batch of derivative limit orders:`,
    ...orders.map(
      (order: any) =>
        `• {{derivativeQuantity:${order.market_id}-${order.order_info.quantity}}} at {{${derivativePriceToken}:${order.market_id}-${order.order_info.price}}} in {{market:${order.market_id}}}`
    )
  ]
}

export const batchCancelSpotOrdersSummary = ({
  value,
  logs
}: ExchangeSummaryParams): string[] => {
  const { sender, data: orders } = value.message

  return [
    `{{account:${sender}}} cancelled a batch of spot limit orders:`,
    ...orders.map((order: any) => {
      const eventSummary = eventLogsSummaryMap[
        EventMessageType.BatchCancelSpotOrders
      ]?.({
        logs,
        sender,
        args: order.order_hash || order.cid
      })

      return eventSummary
        ? `• ${eventSummary}`
        : `• failed to cancel order {{ellipsis:${order.order_hash}}} in {{market:${order.market_id}}}`
    })
  ]
}

export const batchCancelDerivativeOrdersSummary = ({
  value,
  logs
}: ExchangeSummaryParams): string[] => {
  const { sender, data: orders } = value.message

  return [
    `{{account:${sender}}} cancelled a batch of derivative limit orders:`,
    ...orders.map((order: any) => {
      const eventSummary = eventLogsSummaryMap[
        EventMessageType.BatchCancelDerivativeOrders
      ]?.({
        logs,
        sender,
        args: order.order_hash || order.cid
      })

      return eventSummary
        ? `• ${eventSummary}`
        : `• failed to cancel order {{ellipsis:${order.order_hash}}} in {{market:${order.market_id}}}`
    })
  ]
}

export const batchUpdateOrdersSummary = ({
  value,
  logs,
  isV2 = false
}: ExchangeSummaryParams): string[] => {
  const {
    sender,
    spot_orders_to_cancel: spotOrdersToCancel,
    spot_orders_to_create: spotOrdersToCreate,
    derivative_orders_to_cancel: derivativeOrdersToCancel,
    derivative_orders_to_create: derivativeOrdersToCreate,
    spot_market_ids_to_cancel_all: spotMarketIdsToCancelAll,
    derivative_market_ids_to_cancel_all: derivativeMarketIdsToCancelAll
  } = value.message as Record<string, any>

  const derivativePriceToken = isV2 ? 'derivativePriceV2' : 'derivativePrice'
  const spotPriceToken = isV2 ? 'spotPriceV2' : 'spotPrice'

  const cancelAllSpotMarketIds = spotMarketIdsToCancelAll.map(
    (marketId: string) => {
      return `{{account:${sender}}} cancelled all orders in {{market:${marketId}}}`
    }
  )

  const cancelAllDerivativeMarketIds = derivativeMarketIdsToCancelAll.map(
    (marketId: string) => {
      return `{{account:${sender}}} cancelled all orders in {{market:${marketId}}}`
    }
  )

  const derivativeOrders = derivativeOrdersToCreate.map((order: any) => {
    const { quantity, price } = order.order_info
    const { market_id: marketId } = order

    return `{{account:${sender}}} created a LIMIT ${order.order_type} order for {{derivativeQuantity:${marketId}-${quantity}}} at {{${derivativePriceToken}:${marketId}-${price}}} in {{market:${marketId}}}`
  })

  const spotOrders = spotOrdersToCreate.map((order: any) => {
    const { quantity, price } = order.order_info
    const { market_id: marketId } = order

    return `{{account:${sender}}} created a LIMIT ${order.order_type} order for {{spotQuantity:${marketId}-${quantity}}} at {{${spotPriceToken}:${marketId}-${price}}} in {{market:${marketId}}}`
  })

  const spotCancelOrders = spotOrdersToCancel.map((order: any) => {
    const { cid, order_hash: orderHash, market_id: marketId } = order

    const eventSummary = eventLogsSummaryMap[
      EventMessageType.CancelSpotOrder
    ]?.({
      logs,
      sender,
      args: order.cid || order.order_hash
    })

    if (eventSummary) {
      return eventSummary
    }

    return `{{account:${sender}}} failed to cancel order  {{ellipsis:${
      cid || orderHash
    }}} in {{market:${marketId}}}`
  })

  const derivativeCancelOrders = derivativeOrdersToCancel.map((order: any) => {
    const eventSummary = eventLogsSummaryMap[
      EventMessageType.CancelDerivativeOrder
    ]?.({
      logs,
      sender,
      args: order.cid || order.order_hash
    })

    if (eventSummary) {
      return eventSummary
    }

    const { cid, order_hash: orderHash, market_id: marketId } = order

    return `{{account:${sender}}} failed to cancel order {{ellipsis:${
      cid || orderHash
    }}} in {{market:${marketId}}}`
  })

  return [
    ...derivativeOrders,
    ...spotOrders,
    ...spotCancelOrders,
    ...derivativeCancelOrders,
    ...cancelAllSpotMarketIds,
    ...cancelAllDerivativeMarketIds
  ]
}
