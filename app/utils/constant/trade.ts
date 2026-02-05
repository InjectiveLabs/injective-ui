import { IS_TRUE_CURRENT } from './setup'
import { MsgType } from '@injectivelabs/ts-types'

export const TRADING_MESSAGES = [
  MsgType.MsgCancelSpotOrder,
  MsgType.MsgLiquidatePosition,
  MsgType.MsgBatchUpdateOrders,
  MsgType.MsgCreateSpotLimitOrder,
  MsgType.MsgCreateSpotMarketOrder,
  MsgType.MsgCancelDerivativeOrder,
  MsgType.MsgBatchCancelSpotOrders,
  MsgType.MsgIncreasePositionMargin,
  MsgType.MsgCreateDerivativeLimitOrder,
  MsgType.MsgBatchCreateSpotLimitOrders,
  MsgType.MsgCreateDerivativeMarketOrder,
  MsgType.MsgBatchCancelDerivativeOrders,
  MsgType.MsgBatchCreateDerivativeLimitOrders
] as MsgType[]

export const TC_TRADING_MESSAGES = [
  MsgType.MsgExecuteContractCompat
] as MsgType[]

export const tradingMessages = (
  IS_TRUE_CURRENT
    ? [...TC_TRADING_MESSAGES, ...TRADING_MESSAGES]
    : TRADING_MESSAGES
).map((msg) => `/${msg}`)
