import {
  TokenType,
  SpotMarket,
  TokenStatic,
  PerpetualMarket,
  BinaryOptionsMarket,
  ExpiryFuturesMarket
} from '@injectivelabs/sdk-ts'
import {
  sharedToBalanceInWei,
  sharedGetTensMultiplier,
  sharedGetExactDecimalsFromNumber,
  sharedToBalanceInToken
} from '../../utils/formatter'
import { injToken } from '../../data/token'
import { spotMarketIdMap, spotDenomMap } from '../../data/spot'
import {
  SharedMarketType,
  SharedUiSpotMarket,
  SharedUiDerivativeMarket,
  SharedUiBinaryOptionsMarket
} from '../../types'

export * from './summary'
export * from './history'

export const sharedSpotGetSlugAndTicket = ({
  marketId,
  slug,
  ticker,
  baseDenom,
  quoteDenom
}: {
  marketId: string
  slug: string
  ticker: string
  baseDenom: string
  quoteDenom: string
}): { slug: string; ticker: string } => {
  if (spotMarketIdMap[marketId]) {
    return spotMarketIdMap[marketId]
  }

  if (spotDenomMap[baseDenom]) {
    return spotDenomMap[baseDenom]({ slug, ticker })
  }

  if (spotDenomMap[quoteDenom]) {
    return spotDenomMap[quoteDenom]({ slug, ticker })
  }

  return { slug, ticker }
}

export const toUiSpotMarket = ({
  market,
  baseToken,
  quoteToken
}: {
  market: SpotMarket
  baseToken: TokenStatic
  quoteToken: TokenStatic
}): SharedUiSpotMarket => {
  const slug = market.ticker
    .trim()
    .replaceAll('/', '-')
    .replaceAll(' ', '-')
    .toLowerCase()

  const minPriceTickSize = sharedToBalanceInWei({
    value: market.minPriceTickSize,
    decimalPlaces: baseToken.decimals - quoteToken.decimals
  }).toFixed()

  const minQuantityTickSize = sharedToBalanceInWei({
    value: market.minQuantityTickSize,
    decimalPlaces: -baseToken.decimals
  }).toFixed()

  return {
    ...market,
    ...sharedSpotGetSlugAndTicket({
      slug,
      ticker: market.ticker,
      marketId: market.marketId,
      baseDenom: market.baseDenom,
      quoteDenom: market.quoteDenom
    }),
    baseToken,
    quoteToken,
    type: SharedMarketType.Spot,
    subType: SharedMarketType.Spot,
    priceDecimals: sharedGetExactDecimalsFromNumber(minPriceTickSize),
    priceTensMultiplier: sharedGetTensMultiplier(minPriceTickSize),
    quantityDecimals: sharedGetExactDecimalsFromNumber(minQuantityTickSize),
    quantityTensMultiplier: sharedGetTensMultiplier(minQuantityTickSize),
    minNotionalInToken: sharedToBalanceInToken({
      value: market.minNotional,
      decimalPlaces: quoteToken.decimals
    })
  }
}

export const toUiDerivativeMarket = ({
  slug,
  market,
  baseToken,
  quoteToken
}: {
  slug: string
  market: PerpetualMarket | ExpiryFuturesMarket
  baseToken: TokenStatic
  quoteToken: TokenStatic
}): SharedUiDerivativeMarket => {
  {
    const minPriceTickSize = sharedToBalanceInWei({
      value: market.minPriceTickSize,
      decimalPlaces: -quoteToken.decimals
    }).toFixed()

    return {
      ...market,
      slug,
      baseToken,
      quoteToken,
      type: SharedMarketType.Derivative,
      subType: (market as PerpetualMarket).isPerpetual
        ? SharedMarketType.Perpetual
        : SharedMarketType.Futures,
      priceDecimals: sharedGetExactDecimalsFromNumber(minPriceTickSize),
      priceTensMultiplier: sharedGetTensMultiplier(minPriceTickSize),
      quantityDecimals: sharedGetExactDecimalsFromNumber(
        market.minQuantityTickSize
      ),
      quantityTensMultiplier: sharedGetTensMultiplier(
        market.minQuantityTickSize
      ),
      minNotionalInToken: sharedToBalanceInToken({
        value: market.minNotional,
        decimalPlaces: quoteToken.decimals
      })
    }
  }
}

export const toUiBinaryOptionsMarket = ({
  market,
  quoteToken
}: {
  market: BinaryOptionsMarket
  quoteToken: TokenStatic
}): SharedUiBinaryOptionsMarket => {
  const slug = market.ticker
    .replaceAll('/', '-')
    .replaceAll(' ', '-')
    .toLowerCase()

  const [baseTokenSymbol] = quoteToken
    ? market.ticker.replace(quoteToken.symbol, '')
    : market.ticker.replace('/', '')

  const baseToken = {
    ...injToken,
    denom: slug,
    symbol: baseTokenSymbol,
    name: baseTokenSymbol,
    decimals: 18,
    coinGeckoId: '',
    tokenType: TokenType.Native
  } as TokenStatic

  const minPriceTickSize = sharedToBalanceInWei({
    value: market.minPriceTickSize,
    decimalPlaces: baseToken.decimals - quoteToken.decimals
  }).toFixed()

  const minQuantityTickSize = sharedToBalanceInWei({
    value: market.minQuantityTickSize,
    decimalPlaces: -baseToken.decimals
  }).toFixed()

  return {
    ...market,
    slug,
    baseToken,
    quoteToken,
    type: SharedMarketType.BinaryOptions,
    subType: SharedMarketType.BinaryOptions,
    priceDecimals: sharedGetExactDecimalsFromNumber(minPriceTickSize),
    priceTensMultiplier: sharedGetTensMultiplier(minPriceTickSize),
    quantityDecimals: sharedGetExactDecimalsFromNumber(minQuantityTickSize),
    quantityTensMultiplier: sharedGetTensMultiplier(minQuantityTickSize),
    minNotionalInToken: sharedToBalanceInToken({
      value: market.minNotional,
      decimalPlaces: quoteToken.decimals
    })
  }
}
