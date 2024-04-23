import { Orderbook, SpotTrade, DerivativeTrade } from '@injectivelabs/sdk-ts'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'

export interface SharedUiSpotTrade extends SpotTrade {
  ticker?: string
}

export interface SharedUiDerivativeTrade extends DerivativeTrade {
  ticker?: string
}

export interface SharedUiPriceLevel {
  price: string
  quantity: BigNumberInWei | string
  timestamp: number
  aggregatePrices?: string[]
}

export interface SharedUiOrderbookPriceLevel {
  price: string
  quantity: BigNumberInWei
  timestamp: number
  oldQuantity?: string
  total: BigNumberInBase
  depth: number
  aggregatePrices?: string[]
  aggregatedPrice?: string
}

export interface SharedUiOrderbookSummary {
  quantity: BigNumberInBase
  total: BigNumberInBase
}

export interface SharedUiOrderbookWithSequence extends Orderbook {
  sequence: number
}
