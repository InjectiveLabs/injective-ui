import { computed, Ref } from 'vue'
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'

const DEFAULT_DECIMAL_PLACES = 2
const DEFAULT_MINIMAL_DISPLAY_DECIMAL_PLACES = 4
const DEFAULT_INJ_FEE = 0.01
const DEFAULT_ROUNDING_MODE = BigNumberInBase.ROUND_DOWN

export function useBigNumberFormatter(
  value: Ref<String | Number | BigNumberInBase>,
  options: {
    decimalPlaces?: number
    minimalDecimalPlaces?: number
    injFee?: number
    roundingMode?: BigNumber.RoundingMode
  } = {}
) {
  const decimalPlaces = options.decimalPlaces || DEFAULT_DECIMAL_PLACES
  const minimalDecimalPlaces =
    options.minimalDecimalPlaces || DEFAULT_MINIMAL_DISPLAY_DECIMAL_PLACES
  const injFee = options.injFee || DEFAULT_INJ_FEE
  const roundingMode = options.roundingMode || DEFAULT_ROUNDING_MODE
  const minimalDisplayAmount = new BigNumber(1).shiftedBy(-minimalDecimalPlaces)

  const valueToBigNumber = computed(() => {
    if (BigNumber.isBigNumber(value.value)) {
      return value.value
    }

    return new BigNumberInBase(value.value as string)
  })

  const valueToFixed = computed(() => {
    if (valueToBigNumber.value.isNaN() || valueToBigNumber.value.lte(0)) {
      return '0.00'
    }

    return valueToBigNumber.value.toFixed(decimalPlaces, roundingMode)
  })

  const valueToString = computed(() => {
    if (valueToBigNumber.value.isNaN() || valueToBigNumber.value.lte(0)) {
      return '0.00'
    }

    if (valueToBigNumber.value.lte(minimalDisplayAmount)) {
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
    if (valueToBigNumber.value.isNaN() || valueWithGasBuffer.value.lte(0)) {
      return '0.00'
    }

    return valueWithGasBuffer.value.toFixed(decimalPlaces, roundingMode)
  })

  const valueWithGasBufferToString = computed(() => {
    if (valueToBigNumber.value.isNaN() || valueWithGasBuffer.value.lte(0)) {
      return '0.00'
    }

    if (valueWithGasBuffer.value.lte(minimalDisplayAmount)) {
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
