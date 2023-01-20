import { computed, Ref } from 'vue'
import {
  BigNumber,
  BigNumberInBase,
  getExactDecimalsFromNumber
} from '@injectivelabs/utils'

const ZERO_IN_BASE = new BigNumberInBase(0)
const DEFAULT_DECIMAL_PLACES = 2
const DEFAULT_MINIMAL_DISPLAY_DECIMAL_PLACES = 4
const DEFAULT_MAX_MINIMAL_DISPLAY_DECIMAL_PLACES = 12
const DEFAULT_INJ_FEE = 0.01
const DEFAULT_ROUNDING_MODE = BigNumberInBase.ROUND_DOWN

const getNumberMinimalDecimals = (
  value: Ref<BigNumberInBase>,
  defaultMinimalDecimalPlaces?: number
) => {
  const valueExactDecimals = getExactDecimalsFromNumber(value.value.toFixed())
  const minimalDecimalPlaces =
    defaultMinimalDecimalPlaces || DEFAULT_MINIMAL_DISPLAY_DECIMAL_PLACES
  const minNumberFromDefaultMinDecimals = new BigNumberInBase(1).shiftedBy(
    -minimalDecimalPlaces
  )

  if (value.value.eq(0)) {
    return {
      minimalDecimalPlaces: 2,
      minimalDisplayAmount: ZERO_IN_BASE
    }
  }

  /**
   * The number is within the range of minimal decimals,
   * for example if minimalDecimalPlaces = 4, the number is
   * higher than 0.0001
   */
  if (value.value.gt(minNumberFromDefaultMinDecimals)) {
    return {
      minimalDecimalPlaces,
      minimalDisplayAmount: new BigNumber(1).shiftedBy(-minimalDecimalPlaces)
    }
  }

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

export function useBigNumberFormatter(
  value: Ref<String | Number | BigNumberInBase>,
  options: {
    decimalPlaces?: number
    minimalDecimalPlaces?: number
    injFee?: number
    roundingMode?: BigNumber.RoundingMode
  } = {}
) {
  const valueToBigNumber = computed(() => {
    if (BigNumber.isBigNumber(value.value)) {
      return value.value
    }

    return new BigNumberInBase(value.value as string)
  })

  const decimalPlaces = options.decimalPlaces || DEFAULT_DECIMAL_PLACES
  const { minimalDecimalPlaces, minimalDisplayAmount } =
    getNumberMinimalDecimals(valueToBigNumber, options.minimalDecimalPlaces)
  const injFee = options.injFee || DEFAULT_INJ_FEE
  const roundingMode = options.roundingMode || DEFAULT_ROUNDING_MODE

  const valueToFixed = computed(() => {
    if (valueToBigNumber.value.isNaN() || valueToBigNumber.value.isZero()) {
      return '0.00'
    }

    return valueToBigNumber.value.toFixed(decimalPlaces, roundingMode)
  })

  const valueToString = computed(() => {
    if (valueToBigNumber.value.isNaN() || valueToBigNumber.value.isZero()) {
      return '0.00'
    }

    if (valueToBigNumber.value.lt(minimalDisplayAmount)) {
      return `< ${minimalDisplayAmount.toFormat(minimalDecimalPlaces)}`
    }

    return valueToBigNumber.value.toFormat(decimalPlaces, roundingMode)
  })

  const valueWithGasBuffer = computed(() => {
    if (valueToBigNumber.value.isNaN() || valueToBigNumber.value.lte(injFee)) {
      return new BigNumberInBase(0)
    }

    return valueToBigNumber.value.minus(injFee)
  })

  const valueWithGasBufferToFixed = computed(() => {
    if (valueToBigNumber.value.isNaN() || valueToBigNumber.value.isZero()) {
      return '0.00'
    }

    return valueWithGasBuffer.value.toFixed(decimalPlaces, roundingMode)
  })

  const valueWithGasBufferToString = computed(() => {
    if (valueToBigNumber.value.isNaN() || valueToBigNumber.value.isZero()) {
      return '0.00'
    }

    if (valueWithGasBuffer.value.lt(minimalDisplayAmount)) {
      return `< ${minimalDisplayAmount.toFormat(minimalDecimalPlaces)}`
    }

    return valueWithGasBuffer.value.toFormat(decimalPlaces, roundingMode)
  })

  return {
    valueToBigNumber,
    valueToFixed,
    valueToString,
    valueWithGasBuffer,
    valueWithGasBufferToFixed,
    valueWithGasBufferToString
  }
}
