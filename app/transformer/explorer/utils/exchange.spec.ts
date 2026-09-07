import { it, expect, describe } from 'vitest'
import {
  batchUpdateOrdersSummary,
  createSpotLimitOrderSummary,
  createSpotMarketOrderSummary,
  batchCreateSpotLimitOrdersSummary
} from './exchange'
import { getHumanReadableMessage } from '../messageSummary'
import type { Message, EventLog } from '@injectivelabs/sdk-ts'

const MARKET_ID =
  '0xa8c14f892f7f7d2516442220a05b652d5afee3f57a5495981dfadad7c99ef78e84'

const buildMessage = (type: string, message: any): Message =>
  ({ type, message }) as unknown as Message

const logs: EventLog[] = []

describe('exchange message summaries - v1 quantities', () => {
  it('createSpotMarketOrderSummary emits spotQuantity token for v1', () => {
    const summary = createSpotMarketOrderSummary({
      logs,
      value: buildMessage('injective.exchange.v1beta1.MsgCreateSpotMarketOrder', {
        sender: 'inj1sender',
        order: {
          market_id: MARKET_ID,
          order_info: { quantity: '59829000000000000000' },
          order_type: 'BUY'
        }
      })
    })

    expect(summary[0]).toContain(
      `{{spotQuantity:${MARKET_ID}-59829000000000000000}}`
    )
  })

  it('createSpotLimitOrderSummary emits spotQuantity and spotPrice tokens for v1', () => {
    const summary = createSpotLimitOrderSummary({
      logs,
      value: buildMessage('injective.exchange.v1beta1.MsgCreateSpotLimitOrder', {
        sender: 'inj1sender',
        order: {
          market_id: MARKET_ID,
          order_info: { quantity: '59829000000000000000', price: '5049000000' },
          order_type: 'BUY'
        }
      })
    })

    expect(summary[0]).toContain(
      `{{spotQuantity:${MARKET_ID}-59829000000000000000}}`
    )
    expect(summary[0]).toContain(`{{spotPrice:${MARKET_ID}-5049000000}}`)
  })

  it('batchCreateSpotLimitOrdersSummary emits spotQuantity token for v1', () => {
    const summary = batchCreateSpotLimitOrdersSummary({
      logs,
      value: buildMessage(
        'injective.exchange.v1beta1.MsgBatchCreateSpotLimitOrders',
        {
          sender: 'inj1sender',
          orders: [
            {
              market_id: MARKET_ID,
              order_info: {
                quantity: '1000000000000000000',
                price: '5049000000'
              }
            }
          ]
        }
      )
    })

    expect(summary[1]).toContain(
      `{{spotQuantity:${MARKET_ID}-1000000000000000000}}`
    )
    expect(summary[1]).toContain(`{{spotPrice:${MARKET_ID}-5049000000}}`)
  })

  it('batchUpdateOrdersSummary emits spotQuantity token for v1 spot orders', () => {
    const summary = batchUpdateOrdersSummary({
      logs,
      value: buildMessage(
        'injective.exchange.v1beta1.MsgBatchUpdateOrders',
        {
          sender: 'inj1sender',
          spot_orders_to_cancel: [],
          derivative_orders_to_cancel: [],
          spot_orders_to_create: [
            {
              market_id: MARKET_ID,
              order_info: {
                quantity: '1000000000000000000',
                price: '5049000000'
              },
              order_type: 'BUY'
            }
          ],
          derivative_orders_to_create: [],
          spot_market_ids_to_cancel_all: [],
          derivative_market_ids_to_cancel_all: []
        }
      )
    })

    expect(summary[0]).toContain(
      `{{spotQuantity:${MARKET_ID}-1000000000000000000}}`
    )
    expect(summary[0]).toContain(`{{spotPrice:${MARKET_ID}-5049000000}}`)
  })
})

describe('exchange message summaries - v2 quantities', () => {
  it('createSpotMarketOrderSummary emits spotQuantityV2 token for v2', () => {
    const summary = createSpotMarketOrderSummary({
      logs,
      isV2: true,
      value: buildMessage('injective.exchange.v2.MsgCreateSpotMarketOrder', {
        sender: 'inj1sender',
        order: {
          market_id: MARKET_ID,
          order_info: { quantity: '59.829000000000000000' },
          order_type: 'BUY'
        }
      })
    })

    expect(summary[0]).toContain(
      `{{spotQuantityV2:${MARKET_ID}-59.829000000000000000}}`
    )
    expect(summary[0]).not.toContain('{{spotQuantity:')
  })

  it('createSpotLimitOrderSummary emits spotQuantityV2 and spotPriceV2 tokens for v2', () => {
    const summary = createSpotLimitOrderSummary({
      logs,
      isV2: true,
      value: buildMessage('injective.exchange.v2.MsgCreateSpotLimitOrder', {
        sender: 'inj1sender',
        order: {
          market_id: MARKET_ID,
          order_info: {
            quantity: '59.829000000000000000',
            price: '5.049000000000000000'
          },
          order_type: 'BUY_PO'
        }
      })
    })

    expect(summary[0]).toContain(
      `{{spotQuantityV2:${MARKET_ID}-59.829000000000000000}}`
    )
    expect(summary[0]).toContain(
      `{{spotPriceV2:${MARKET_ID}-5.049000000000000000}}`
    )
    expect(summary[0]).not.toContain('{{spotQuantity:')
    expect(summary[0]).not.toContain('{{spotPrice:')
  })

  it('batchCreateSpotLimitOrdersSummary emits spotQuantityV2 token for v2', () => {
    const summary = batchCreateSpotLimitOrdersSummary({
      logs,
      isV2: true,
      value: buildMessage(
        'injective.exchange.v2.MsgBatchCreateSpotLimitOrders',
        {
          sender: 'inj1sender',
          orders: [
            {
              market_id: MARKET_ID,
              order_info: {
                quantity: '1.000000000000000000',
                price: '5.049000000000000000'
              }
            }
          ]
        }
      )
    })

    expect(summary[1]).toContain(
      `{{spotQuantityV2:${MARKET_ID}-1.000000000000000000}}`
    )
    expect(summary[1]).toContain(
      `{{spotPriceV2:${MARKET_ID}-5.049000000000000000}}`
    )
  })

  it('batchUpdateOrdersSummary emits v2 tokens for spot orders and keeps derivative quantity token', () => {
    const summary = batchUpdateOrdersSummary({
      logs,
      isV2: true,
      value: buildMessage('injective.exchange.v2.MsgBatchUpdateOrders', {
        sender: 'inj1sender',
        spot_orders_to_cancel: [],
        derivative_orders_to_cancel: [],
        spot_orders_to_create: [
          {
            market_id: MARKET_ID,
            order_info: {
              quantity: '1.000000000000000000',
              price: '5.049000000000000000'
            },
            order_type: 'BUY'
          }
        ],
        derivative_orders_to_create: [
          {
            market_id: MARKET_ID,
            order_info: {
              quantity: '0.200000000000000000',
              price: '5.159000000000000000'
            },
            order_type: 'BUY'
          }
        ],
        spot_market_ids_to_cancel_all: [],
        derivative_market_ids_to_cancel_all: []
      })
    })

    expect(summary[0]).toContain(
      `{{derivativeQuantity:${MARKET_ID}-0.200000000000000000}}`
    )
    expect(summary[0]).toContain(
      `{{derivativePriceV2:${MARKET_ID}-5.159000000000000000}}`
    )
    expect(summary[1]).toContain(
      `{{spotQuantityV2:${MARKET_ID}-1.000000000000000000}}`
    )
    expect(summary[1]).toContain(
      `{{spotPriceV2:${MARKET_ID}-5.049000000000000000}}`
    )
  })
})

describe('getHumanReadableMessage - v2 message dispatch', () => {
  it('routes injective.exchange.v2.MsgCreateSpotLimitOrder with v2 quantity token', () => {
    const summaries = getHumanReadableMessage({
      logs,
      value: buildMessage('/injective.exchange.v2.MsgCreateSpotLimitOrder', {
        sender: 'inj1k8txa2875vzlgf8afqn3lz9gv23rv6k9we59zj',
        order: {
          market_id: MARKET_ID,
          order_info: {
            subaccount_id:
              '0xb1d66ea8fea305f424fd48271f88a862a2366ac5000000000000000000000001',
            fee_recipient: 'inj1k8txa2875vzlgf8afqn3lz9gv23rv6k9we59zj',
            price: '5.049000000000000000',
            quantity: '59.829000000000000000'
          },
          order_type: 'BUY_PO'
        }
      })
    })

    expect(summaries).toHaveLength(1)
    expect(summaries[0]).toContain(
      `{{spotQuantityV2:${MARKET_ID}-59.829000000000000000}}`
    )
    expect(summaries[0]).toContain(
      `{{spotPriceV2:${MARKET_ID}-5.049000000000000000}}`
    )
  })
})
