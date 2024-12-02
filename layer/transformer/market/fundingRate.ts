import {
  type PerpetualMarketInfo,
  type PerpetualMarketFunding
} from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { ZERO_IN_BASE } from './../../utils/constant'

export const getTwapEst = (funding: PerpetualMarketFunding) => {
  const currentUnixTime = Math.floor(Date.now() / 1000)
  const divisor = new BigNumberInBase(currentUnixTime).mod(3600).times(24)

  if (divisor.lte(0)) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(funding.cumulativePrice).dividedBy(divisor)
}

export const formatFundingRate = ({
  info,
  funding
}: {
  info?: PerpetualMarketInfo
  funding?: PerpetualMarketFunding
}) => {
  if (!info || !funding) {
    return ZERO_IN_BASE
  }

  const hourlyFundingRateCap = new BigNumberInBase(info.hourlyFundingRateCap)
  const estFundingRate = new BigNumberInBase(info.hourlyInterestRate).plus(
    getTwapEst(funding)
  )

  if (estFundingRate.gt(hourlyFundingRateCap)) {
    return new BigNumberInBase(hourlyFundingRateCap).multipliedBy(100)
  }

  if (estFundingRate.lt(hourlyFundingRateCap.times(-1))) {
    return new BigNumberInBase(hourlyFundingRateCap).times(-1).multipliedBy(100)
  }

  return new BigNumberInBase(estFundingRate).multipliedBy(100)
}
