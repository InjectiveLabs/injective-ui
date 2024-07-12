import { BigNumberInWei } from '@injectivelabs/utils'
import { spotMarketIdMap, spotDenomMap } from './../data/spot'
import { SharedUiSpotMarket } from './../types'

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

export const formatPriceToSpotMarketPrice = ({
  price,
  market
}: {
  price: string
  market: SharedUiSpotMarket
}) =>
  new BigNumberInWei(price).toBase(
    market.quoteToken.decimals - market.baseToken.decimals
  )
