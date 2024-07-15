import {
  BigNumber,
  BigNumberInWei,
  BigNumberInBase
} from '@injectivelabs/utils'
import { Coin } from '@injectivelabs/sdk-ts'
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

export const sharedConvertTimestampToMilliseconds = (
  timestamp: number | string
): number => {
  const timestampInBigNumber = new BigNumberInBase(timestamp)

  if (timestamp.toString().length > 13) {
    const formatNumberBy = new BigNumberInBase(10).pow(
      timestamp.toString().length - 13
    )

    const formattedValue = timestampInBigNumber
      .dividedBy(formatNumberBy)
      .toFixed(0, BigNumber.ROUND_HALF_UP)

    return new BigNumberInBase(formattedValue).toNumber()
  }

  if (timestamp.toString().length < 13) {
    const trailingZeros = 13 - timestamp.toString().length

    return timestampInBigNumber.times(10 ** trailingZeros).toNumber()
  }

  return timestampInBigNumber.toNumber()
}

export const sharedGetExactDecimalsFromNumber = (
  number: number | string
): number => {
  if (!number.toString().includes('.')) {
    return 0
  }

  if (Number(number) % 1 === 0) {
    return 0
  }

  const [, decimals] = number.toString().split('.')

  if (!decimals) {
    return 0
  }

  return decimals.length
}

export const sharedGetTensMultiplier = (number: number | string): number => {
  const numberToBn = new BigNumber(number)

  if (numberToBn.eq(1)) {
    return 0
  }

  if (numberToBn.lt(1)) {
    return -1 * sharedGetExactDecimalsFromNumber(numberToBn.toFixed())
  }

  const [, zerosInTheNumber] = numberToBn.toFixed().split('1')

  return zerosInTheNumber.length
}

export const sharedEllipsisFormatText = (text: string, length = 20): string => {
  return text.length > length
    ? `${text.slice(0, length)}...${text.slice(
        text.length - length,
        text.length
      )}`
    : text
}

export const sharedCoinStringToCoins = (coinString: string): Coin[] => {
  return coinString.split(',').map((coin) => {
    // is used to remove any empty strings that might result from the split operation.
    const [amount, denom] = coin.split(/(\d+)/).filter(Boolean)

    return {
      denom,
      amount
    }
  })
}
