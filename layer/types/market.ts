import {
  SpotMarket,
  TokenStatic,
  PerpetualMarket,
  ExpiryFuturesMarket,
  BinaryOptionsMarket,
  AllChronosDerivativeMarketSummary
} from '@injectivelabs/sdk-ts'
import { SharedMarketType, SharedMarketChange } from './enum'

export interface SharedUiSpotMarket
  extends Omit<SpotMarket, 'quoteToken' | 'baseToken'> {
  baseToken: TokenStatic
  quoteToken: TokenStatic
  slug: string
  priceDecimals: number
  quantityDecimals: number
  priceTensMultiplier: number
  quantityTensMultiplier: number
  type: SharedMarketType
  subType: SharedMarketType
  upcoming?: boolean
  minNotionalInToken: string
}

export interface SharedUiDerivativeMarket
  extends Omit<PerpetualMarket, 'quoteToken'> {
  baseToken: TokenStatic
  quoteToken: TokenStatic
  slug: string
  priceDecimals: number
  quantityDecimals: number
  priceTensMultiplier: number
  quantityTensMultiplier: number
  minNotionalInToken: string
  type: SharedMarketType
  subType: SharedMarketType
  upcoming?: boolean
}

export interface SharedUiExpiryFuturesMarket
  extends Omit<ExpiryFuturesMarket, 'quoteToken'> {
  baseToken: TokenStatic
  quoteToken: TokenStatic
  slug: string
  priceDecimals: number
  quantityDecimals: number
  priceTensMultiplier: number
  quantityTensMultiplier: number
  minNotionalInToken: string
  type: SharedMarketType
  subType: SharedMarketType
  upcoming?: boolean
}

export interface SharedUiBinaryOptionsMarket
  extends Omit<BinaryOptionsMarket, 'quoteToken'> {
  baseToken: TokenStatic
  quoteToken: TokenStatic
  slug: string
  priceDecimals: number
  quantityDecimals: number
  priceTensMultiplier: number
  quantityTensMultiplier: number
  minNotionalInToken: string
  type: SharedMarketType
  subType: SharedMarketType
  upcoming?: boolean
}

export interface SharedUiMarketSummary
  extends AllChronosDerivativeMarketSummary {
  lastPrice?: number
  lastPriceChange?: SharedMarketChange
}

export interface SharedUiMarketHistory {
  marketId: string
  resolution: string
  time: number[]
  volume: number[]
  closePrice: number[]
  highPrice: number[]
  lowPrice: number[]
  openPrice: number[]
}

export type SharedUiMarketMarkPrice = {
  price: string
  marketId: string
  timestamp?: number
}
