import {
  SpotMarket,
  PerpetualMarket,
  BinaryOptionsMarket
} from '@injectivelabs/sdk-ts'
import { TokenStatic } from '@injectivelabs/token-metadata'
import { SharedMarketType } from './enum'

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
  type: SharedMarketType
  subType: SharedMarketType
  upcoming?: boolean
}
