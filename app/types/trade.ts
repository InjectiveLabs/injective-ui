import type { BigNumber } from '@injectivelabs/utils'
import type {
  Orderbook,
  SpotTrade,
  DerivativeTrade
} from '@injectivelabs/sdk-ts'

export interface SharedUiSpotTrade extends SpotTrade {
  ticker?: string
}

export interface SharedUiDerivativeTrade extends DerivativeTrade {
  ticker?: string
}

export interface SharedUiOrderbookSummary {
  total: BigNumber
  quantity: BigNumber
}

export interface SharedUiOrderbookWithSequence extends Orderbook {
  sequence: number
}

export interface SharedUiPriceLevel {
  price: string
  timestamp: number
  aggregatePrices?: string[]
  quantity: string | BigNumber
}

export interface SharedUiOrderbookPriceLevel {
  price: string
  depth: number
  total: BigNumber
  timestamp: number
  quantity: BigNumber
  oldQuantity?: string
  aggregatedPrice?: string
  aggregatePrices?: string[]
}
