import {
  type PerpetualMarket,
  type ExpiryFuturesMarket
} from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from './../../utils/constant'

export const getTwapEst = (market: PerpetualMarket) => {
  if (!market.perpetualMarketFunding) {
    return ZERO_IN_BASE
  }

  const currentUnixTime = Math.floor(Date.now() / 1000)
  const divisor = new BigNumberInBase(currentUnixTime).mod(3600).times(24)

  if (divisor.lte(0)) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(
    market.perpetualMarketFunding.cumulativePrice
  ).dividedBy(divisor)
}

export const formatFundingRate = (
  market: PerpetualMarket | ExpiryFuturesMarket
) => {
  const perpMarket = market as PerpetualMarket

  if (!perpMarket.isPerpetual || !perpMarket.perpetualMarketInfo) {
    return ZERO_IN_BASE
  }

  const hourlyFundingRateCap = new BigNumberInBase(
    perpMarket.perpetualMarketInfo.hourlyFundingRateCap
  )
  const estFundingRate = new BigNumberInBase(
    perpMarket.perpetualMarketInfo.hourlyInterestRate
  ).plus(getTwapEst(market))

  if (estFundingRate.gt(hourlyFundingRateCap)) {
    return new BigNumberInBase(hourlyFundingRateCap).multipliedBy(100)
  }

  if (estFundingRate.lt(hourlyFundingRateCap.times(-1))) {
    return new BigNumberInBase(hourlyFundingRateCap).times(-1).multipliedBy(100)
  }

  return new BigNumberInBase(estFundingRate).multipliedBy(100)
}
