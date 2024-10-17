import {
  BigNumber,
  BigNumberInBase,
  getExactDecimalsFromNumber
} from '@injectivelabs/utils'
import {
  ZERO_IN_BASE,
  INJ_REQUIRED_FOR_GAS,
  DEFAULT_ROUNDING_MODE,
  DEFAULT_BIG_NUMBER_DECIMAL_PLACES
} from './constant'

export const DEFAULT_MINIMAL_DISPLAY_DECIMAL_PLACES = 4
export const DEFAULT_MAX_MINIMAL_DISPLAY_DECIMAL_PLACES = 12

export const getFormattedZeroValue = (decimalPlaces: number): string => {
  if (decimalPlaces > 0) {
    return `0.${'0'.repeat(decimalPlaces)}`
  }
  return '0.0'
}

export const unAbbreviateNumber = (
  value: string
): BigNumberInBase | undefined => {
  const units = {
    K: Number(`1${'0'.repeat(3)}`),
    M: Number(`1${'0'.repeat(6)}`),
    B: Number(`1${'0'.repeat(9)}`),
    T: Number(`1${'0'.repeat(12)}`)
  } as Record<string, number>

  const unit = value.at(-1)

  if (!unit || !units[unit]) {
    return
  }

  const formattedValue = value.replaceAll(',', '').slice(0, -1)

  return new BigNumberInBase(formattedValue).multipliedBy(units[unit])
}

export const abbreviateNumber = (number: number): string => {
  const abbreviatedValue = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(number)

  const abbreviatedValueMatchesInput = new BigNumberInBase(number).eq(
    unAbbreviateNumber(abbreviatedValue) || '0'
  )

  return abbreviatedValueMatchesInput
    ? abbreviatedValue
    : `≈${abbreviatedValue}`
}

export const getNumberMinimalDecimals = (
  value: BigNumberInBase,
  defaultMinimalDecimalPlaces?: number,
  displayAbsoluteDecimalPlace?: boolean
) => {
  const valueExactDecimals = getExactDecimalsFromNumber(value.toFixed())
  const minimalDecimalPlaces =
    defaultMinimalDecimalPlaces ?? DEFAULT_MINIMAL_DISPLAY_DECIMAL_PLACES
  const minNumberFromDefaultMinDecimals = new BigNumberInBase(1).shiftedBy(
    -minimalDecimalPlaces
  )

  if (value.eq(0)) {
    return {
      minimalDecimalPlaces: 2,
      minimalDisplayAmount: ZERO_IN_BASE
    }
  }

  /**
   * The number is less then the range of minimal decimals,
   * for example if minimalDecimalPlaces = 4, the number is
   * smaller than 0.0001
   * show exact decimal places the based on the value provided up to 12 decimal places
   * i.e a value with 0.000001010102 will be displayed as < 0.000001
   */
  if (
    value.lte(minNumberFromDefaultMinDecimals) &&
    displayAbsoluteDecimalPlace
  ) {
    const actualMinimalDecimalPlaces =
      valueExactDecimals > DEFAULT_MAX_MINIMAL_DISPLAY_DECIMAL_PLACES
        ? DEFAULT_MAX_MINIMAL_DISPLAY_DECIMAL_PLACES
        : valueExactDecimals
    const minimalDisplayAmount = new BigNumber(1).shiftedBy(
      -actualMinimalDecimalPlaces
    )

    /**
     * Go up to 12 decimals if needed, which is a maximum we can support
     * at this point
     */
    return {
      minimalDisplayAmount,
      minimalDecimalPlaces: actualMinimalDecimalPlaces
    }
  }

  /*
   * display the value based on the minimalDecimalPlaces value provided
   * which is default to 4, if not provided
   * for example minimalDecimalPlaces: 3 will show <0.01 if value is less then 0.01
   */
  return {
    minimalDecimalPlaces,
    minimalDisplayAmount: new BigNumber(1).shiftedBy(-minimalDecimalPlaces)
  }
}

export const convertToBigNumber = (
  value: string | number | BigNumberInBase
): BigNumberInBase => {
  if (!value) {
    return new BigNumberInBase(0)
  }

  if (BigNumber.isBigNumber(value)) {
    return value as BigNumberInBase
  }

  return new BigNumberInBase(value as string)
}

export const convertValueToFixed = ({
  options,
  roundingMode,
  decimalPlaces,
  valueToBigNumber
}: {
  options: {
    shouldTruncate?: boolean
    abbreviationFloor?: number
  }
  roundingMode: BigNumber.RoundingMode
  decimalPlaces: number
  valueToBigNumber: BigNumberInBase
}): string => {
  if (valueToBigNumber.isNaN() || valueToBigNumber.isZero()) {
    return options.shouldTruncate ? '0' : getFormattedZeroValue(decimalPlaces)
  }

  if (
    options.abbreviationFloor &&
    valueToBigNumber.gte(options.abbreviationFloor)
  ) {
    return abbreviateNumber(valueToBigNumber.toNumber())
  }

  const roundedValue = valueToBigNumber.toFixed(decimalPlaces, roundingMode)

  if (options.shouldTruncate) {
    return new BigNumberInBase(roundedValue).toFixed()
  }

  return roundedValue
}

export const convertValueToString = ({
  options,
  roundingMode,
  decimalPlaces,
  valueToBigNumber
}: {
  options: {
    shouldTruncate?: boolean
    abbreviationFloor?: number
    minimalDecimalPlaces?: number
    displayAbsoluteDecimalPlace?: boolean
  }
  roundingMode: BigNumber.RoundingMode
  decimalPlaces: number
  valueToBigNumber: BigNumberInBase
}): string => {
  if (valueToBigNumber.isNaN() || valueToBigNumber.isZero()) {
    return options.shouldTruncate ? '0' : getFormattedZeroValue(decimalPlaces)
  }

  if (
    options.abbreviationFloor &&
    valueToBigNumber.gte(options.abbreviationFloor)
  ) {
    return abbreviateNumber(valueToBigNumber.toNumber())
  }

  const { minimalDecimalPlaces, minimalDisplayAmount } =
    getNumberMinimalDecimals(
      valueToBigNumber,
      options.minimalDecimalPlaces,
      options.displayAbsoluteDecimalPlace
    )

  const roundedValue = valueToBigNumber.toFixed(decimalPlaces, roundingMode)

  if (options.shouldTruncate) {
    return new BigNumberInBase(roundedValue).toFormat()
  }

  if (valueToBigNumber.abs().lt(minimalDisplayAmount)) {
    return `< ${minimalDisplayAmount.toFormat(minimalDecimalPlaces)}`
  }

  return new BigNumberInBase(roundedValue).toFormat(decimalPlaces)
}

export const computeValueWithGasBuffer = (
  valueToBigNumber: BigNumberInBase,
  injFee: number
): BigNumberInBase => {
  if (valueToBigNumber.isNaN() || valueToBigNumber.lte(injFee)) {
    return new BigNumberInBase(0)
  }

  return valueToBigNumber.minus(injFee)
}

export const computeValueWithGasBufferToFixed = ({
  roundingMode,
  decimalPlaces,
  valueWithGasBuffer
}: {
  roundingMode: BigNumber.RoundingMode
  decimalPlaces: number
  valueWithGasBuffer: BigNumberInBase
}): string => {
  if (valueWithGasBuffer.isNaN() || valueWithGasBuffer.isZero()) {
    return getFormattedZeroValue(decimalPlaces)
  }

  return valueWithGasBuffer.toFixed(decimalPlaces, roundingMode)
}

export const computeValueWithGasBufferToString = ({
  options,
  roundingMode,
  decimalPlaces,
  valueWithGasBuffer
}: {
  options: {
    abbreviationFloor?: number
    minimalDecimalPlaces?: number
    displayAbsoluteDecimalPlace?: boolean
  }
  roundingMode: BigNumber.RoundingMode
  decimalPlaces: number
  valueWithGasBuffer: BigNumberInBase
}): string => {
  if (valueWithGasBuffer.isNaN() || valueWithGasBuffer.isZero()) {
    return getFormattedZeroValue(decimalPlaces)
  }

  if (
    options.abbreviationFloor &&
    valueWithGasBuffer.gte(options.abbreviationFloor)
  ) {
    return abbreviateNumber(valueWithGasBuffer.toNumber())
  }

  const { minimalDecimalPlaces, minimalDisplayAmount } =
    getNumberMinimalDecimals(
      valueWithGasBuffer,
      options.minimalDecimalPlaces,
      options.displayAbsoluteDecimalPlace
    )

  if (valueWithGasBuffer.abs().lt(minimalDisplayAmount)) {
    return `< ${minimalDisplayAmount.toFormat(minimalDecimalPlaces)}`
  }

  return valueWithGasBuffer.toFormat(decimalPlaces, roundingMode)
}

export const sharedBigNumberFormatter = (
  value: string | number | BigNumberInBase,
  options: {
    decimalPlaces?: number
    minimalDecimalPlaces?: number
    abbreviationFloor?: number // Whether to abbreviate numbers, e.g., 1,234,455 => 1M
    injFee?: number
    roundingMode?: BigNumber.RoundingMode
    displayAbsoluteDecimalPlace?: boolean // Explained above
    shouldTruncate?: boolean
  } = {}
) => {
  const roundingMode = options.roundingMode || DEFAULT_ROUNDING_MODE
  const decimalPlaces =
    options.decimalPlaces ?? DEFAULT_BIG_NUMBER_DECIMAL_PLACES
  const injFee = options.injFee ?? INJ_REQUIRED_FOR_GAS

  const valueToBigNumber = convertToBigNumber(value)

  const valueToFixed = convertValueToFixed({
    options,
    roundingMode,
    decimalPlaces,
    valueToBigNumber
  })

  const valueToString = convertValueToString({
    options,
    roundingMode,
    decimalPlaces,
    valueToBigNumber
  })

  const valueWithGasBuffer = computeValueWithGasBuffer(valueToBigNumber, injFee)

  const valueWithGasBufferToFixed = computeValueWithGasBufferToFixed({
    roundingMode,
    decimalPlaces,
    valueWithGasBuffer
  })

  const valueWithGasBufferToString = computeValueWithGasBufferToString({
    options,
    roundingMode,
    decimalPlaces,
    valueWithGasBuffer
  })

  return {
    valueToFixed,
    valueToString,
    valueToBigNumber,
    valueWithGasBuffer,
    valueWithGasBufferToFixed,
    valueWithGasBufferToString
  }
}
