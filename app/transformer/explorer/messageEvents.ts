import { hexToBase64 } from '@injectivelabs/sdk-ts/utils'
import { EventMessageType } from './../../types'
import type { EventLog } from '@injectivelabs/sdk-ts'

/**
 * Check if a string is a valid hex string (with or without 0x prefix)
 */
function isValidHex(str: string): boolean {
  if (typeof str !== 'string' || str.trim() === '') {
    return false
  }
  const hexPart = str.startsWith('0x') ? str.slice(2) : str

  return /^[0-9a-fA-F]+$/.test(hexPart)
}

/**
 * Safely convert hex to base64
 * Returns the converted value if valid hex, otherwise returns the original value as-is
 */
function safeHexToBase64(value: string): string {
  if (!isValidHex(value)) {
    return value
  }
  try {
    return hexToBase64(value.startsWith('0x') ? value.slice(2) : value)
  } catch {
    return value
  }
}

export const eventLogsSummaryMap: Partial<
  Record<
    EventMessageType,
    ({
      args,
      logs,
      sender
    }: {
      args: any
      sender: string
      logs: EventLog[]
    }) => string | undefined
  >
> = {
  [EventMessageType.CancelSpotOrder]: ({ args, logs, sender }) => {
    const orderHashInBase64 = safeHexToBase64(args)

    try {
      const parsedEvents = logs
        .flatMap(({ events }) => events)
        .filter(
          ({ type, attributes }) =>
            type === 'injective.exchange.v1beta1.EventCancelSpotOrder' &&
            attributes.some(({ key, value }) => {
              if (key === 'order') {
                const parsedAttribute = JSON.parse(value)

                return (
                  parsedAttribute.order_info.cid === args ||
                  parsedAttribute.order_hash === orderHashInBase64
                )
              }

              return undefined
            })
        )

      const spotOrder = parsedEvents[0]?.attributes.find(
        ({ key }) => key === 'order'
      )
      const marketId = JSON.parse(
        parsedEvents[0]?.attributes.find(({ key }) => key === 'market_id')
          ?.value || ''
      )

      const { order_info: order, order_type: orderType } = JSON.parse(
        spotOrder?.value || ''
      )

      if (!marketId || !order) {
        return undefined
      }

      return `{{account:${sender}}} cancelled a LIMIT ${orderType} order for {{spotQuantity:${marketId}-${order.quantity}}} at {{spotPrice:${marketId}-${order.price}}} in {{market:${marketId}}}`
    } catch {
      return undefined
    }
  },

  [EventMessageType.BatchCancelSpotOrders]: ({ args, logs }) => {
    const orderHashInBase64 = safeHexToBase64(args)

    try {
      const parsedEvents = logs
        .flatMap(({ events }) => events)
        .filter(
          ({ type, attributes }) =>
            type === 'injective.exchange.v1beta1.EventCancelSpotOrder' &&
            attributes.some(({ key, value }) => {
              if (key === 'order') {
                const parsedAttribute = JSON.parse(value)

                return (
                  parsedAttribute.order_info.cid === args ||
                  parsedAttribute.order_hash === orderHashInBase64
                )
              }

              return undefined
            })
        )

      const spotOrder = parsedEvents[0]?.attributes.find(
        ({ key }) => key === 'order'
      )

      const marketId = JSON.parse(
        parsedEvents[0]?.attributes.find(({ key }) => key === 'market_id')
          ?.value || ''
      )

      const { order_info: order, order_type: orderType } = JSON.parse(
        spotOrder?.value || ''
      )

      if (!marketId || !order) {
        return undefined
      }

      return `cancelled a LIMIT ${orderType} order for {{spotQuantity:${marketId}-${order.quantity}}} at {{spotPrice:${marketId}-${order.price}}} in {{market:${marketId}}}`
    } catch {
      return undefined
    }
  },

  [EventMessageType.CancelDerivativeOrder]: ({ args, logs, sender }) => {
    const orderHashInBase64 = safeHexToBase64(args)

    try {
      const parsedEvents = logs
        .flatMap(({ events }) => events)
        .filter(
          ({ type, attributes }) =>
            [
              'injective.exchange.v1beta1.EventCancelDerivativeOrder',
              'injective.exchange.v1beta1.EventCancelConditionalDerivativeOrder'
            ].includes(type) &&
            attributes.some(({ key, value }) => {
              if (key === 'limit_order' || key === 'market_order') {
                if (!value || value === 'null') {
                  return false
                }

                const parsedAttribute = JSON.parse(value)

                return (
                  parsedAttribute.order_info.cid === args ||
                  parsedAttribute.order_hash === orderHashInBase64
                )
              }

              return undefined
            })
        )

      const derivativeOrder = parsedEvents[0]?.attributes.find(
        ({ key, value }) =>
          value &&
          value !== 'null' &&
          ['limit_order', 'market_order'].includes(key)
      )

      const marketId = JSON.parse(
        parsedEvents[0]?.attributes.find(({ key }) => key === 'market_id')
          ?.value || ''
      )

      const { order_info: order, order_type: orderType } = JSON.parse(
        derivativeOrder?.value || ''
      )

      if (!marketId || !order) {
        return undefined
      }

      return `{{account:${sender}}} cancelled a LIMIT ${orderType} order for {{derivativeQuantity:${marketId}-${order.quantity}}} at {{derivativePrice:${marketId}-${order.price}}} in {{market:${marketId}}}`
    } catch {
      return undefined
    }
  },

  [EventMessageType.BatchCancelDerivativeOrders]: ({ args, logs }) => {
    const orderHashInBase64 = safeHexToBase64(args)

    try {
      const parsedEvents = logs
        .flatMap(({ events }) => events)
        .filter(
          ({ type, attributes }) =>
            [
              'injective.exchange.v1beta1.EventCancelDerivativeOrder',
              'injective.exchange.v1beta1.EventCancelConditionalDerivativeOrder'
            ].includes(type) &&
            attributes.some(({ key, value }) => {
              if (key === 'limit_order' || key === 'market_order') {
                if (!value || value === 'null') {
                  return false
                }

                const parsedAttribute = JSON.parse(value)

                return (
                  parsedAttribute.order_info.cid === args ||
                  parsedAttribute.order_hash === orderHashInBase64
                )
              }

              return undefined
            })
        )

      const derivativeOrder = parsedEvents[0]?.attributes.find(
        ({ key, value }) =>
          value &&
          value !== 'null' &&
          ['limit_order', 'market_order'].includes(key)
      )

      const marketId = JSON.parse(
        parsedEvents[0]?.attributes.find(({ key }) => key === 'market_id')
          ?.value || ''
      )

      const { order_info: order, order_type: orderType } = JSON.parse(
        derivativeOrder?.value || ''
      )

      if (!marketId || !order) {
        return undefined
      }

      return `cancelled a LIMIT ${orderType} order for {{derivativeQuantity:${marketId}-${order.quantity}}} at {{derivativePrice:${marketId}-${order.price}}} in {{market:${marketId}}}`
    } catch {
      return undefined
    }
  }
}
