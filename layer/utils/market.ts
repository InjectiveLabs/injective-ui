import { spotMarketIdMap, spotDenomMap } from '@/data/spot'

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
