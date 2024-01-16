import {
  BigNumber,
  BigNumberInBase,
  BigNumberInWei
} from '@injectivelabs/utils'
import { TimeDuration } from './../types'

export const sharedToBalanceInWei = ({
  value,
  decimalPlaces = 18
}: {
  value: string | number
  decimalPlaces?: number
}): BigNumberInBase => {
  return new BigNumberInBase(10).pow(decimalPlaces).times(value)
}

export const sharedConvertTimestampToMilliseconds = (
  timestamp: number | string
): number => {
  const timestampInBigNumber = new BigNumberInBase(timestamp)

  if (timestamp.toString().length > 13) {
    return timestampInBigNumber
      .precision(13, BigNumber.ROUND_HALF_UP)
      .toNumber()
  }

  if (timestamp.toString().length < 13) {
    const trailingZeros = 13 - timestamp.toString().length

    return timestampInBigNumber.times(10 ** trailingZeros).toNumber()
  }

  return timestampInBigNumber.toNumber()
}

export const sharedToBalanceInTokenInBase = ({
  value,
  decimalPlaces = 18
}: {
  value: string | number
  decimalPlaces?: number
}): BigNumberInBase => {
  return new BigNumberInWei(value).toBase(decimalPlaces)
}

export const sharedToBalanceInToken = ({
  value,
  fixedDecimals,
  roundingMode,
  decimalPlaces = 18
}: {
  value: string | number
  decimalPlaces?: number
  fixedDecimals?: number
  roundingMode?: BigNumber.RoundingMode
}): string => {
  const balanceInToken = sharedToBalanceInTokenInBase({
    value,
    decimalPlaces
  })

  if (fixedDecimals) {
    return balanceInToken.toFixed(fixedDecimals, roundingMode)
  }

  return balanceInToken.toFixed()
}

export const sharedParseRouteQuery = (value: string): string =>
  value.replaceAll('-', '').toLowerCase().trim()

export const sharedFormatSecondsToDisplay = ({
  value,
  roundUp = true
}: {
  value: number
  roundUp?: boolean
}) => {
  if (value === 0) {
    return
  }

  const output = {
    [TimeDuration.Day]: Math.floor(value / (3600 * 24)),
    [TimeDuration.Hour]: Math.floor((value % (3600 * 24)) / 3600),
    [TimeDuration.Minute]: Math.floor((value % 3600) / 60),
    [TimeDuration.Second]: Math.floor(value % 60)
  } as Record<string, number>

  if (!roundUp) {
    return output
  }

  if (output[TimeDuration.Day] === 1 && output[TimeDuration.Hour] === 0) {
    output[TimeDuration.Day] = 0
    output[TimeDuration.Hour] = 24
  }

  if (output[TimeDuration.Hour] === 1 && output.minutes === 0) {
    output[TimeDuration.Hour] = 0
    output[TimeDuration.Minute] = 60
  }

  if (output[TimeDuration.Minute] === 1 && output[TimeDuration.Second] === 0) {
    output[TimeDuration.Minute] = 0
    output[TimeDuration.Second] = 60
  }

  return output
}
