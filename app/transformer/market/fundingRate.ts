import { toBigNumber } from '@injectivelabs/utils'
import { ZERO_IN_BIG_NUMBER } from './../../utils/constant'
import type {
  PerpetualMarketInfo,
  PerpetualMarketFunding
} from '@injectivelabs/sdk-ts'

export const getTwapEst = ({
  info,
  funding
}: {
  info: PerpetualMarketInfo
  funding: PerpetualMarketFunding
}) => {
  const timeInterval = toBigNumber(funding.lastTimestamp)
    .plus(info.fundingInterval)
    .minus(info.nextFundingTimestamp)
    .multipliedBy(24)

  if (timeInterval.eq(0)) {
    return ZERO_IN_BIG_NUMBER
  }

  return toBigNumber(funding.cumulativePrice).dividedBy(timeInterval)
}

export const formatFundingRate = ({
  info,
  funding
}: {
  info?: PerpetualMarketInfo
  funding?: PerpetualMarketFunding
}) => {
  if (!info || !funding) {
    return ZERO_IN_BIG_NUMBER
  }

  const hourlyFundingRateCap = toBigNumber(info.hourlyFundingRateCap)
  const estFundingRate = toBigNumber(info.hourlyInterestRate).plus(
    getTwapEst({ info, funding })
  )

  if (estFundingRate.gt(hourlyFundingRateCap)) {
    return toBigNumber(hourlyFundingRateCap).multipliedBy(100)
  }

  if (estFundingRate.lt(hourlyFundingRateCap.times(-1))) {
    return toBigNumber(hourlyFundingRateCap).times(-1).multipliedBy(100)
  }

  return toBigNumber(estFundingRate).multipliedBy(100)
}
