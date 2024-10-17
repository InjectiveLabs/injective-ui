import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import {
  INJ_REQUIRED_FOR_GAS,
  DEFAULT_ROUNDING_MODE,
  DEFAULT_BIG_NUMBER_DECIMAL_PLACES
} from '../utils/constant'
import {
  convertToBigNumber,
  convertValueToFixed,
  convertValueToString,
  computeValueWithGasBuffer,
  computeValueWithGasBufferToFixed,
  computeValueWithGasBufferToString
} from '../utils/bigNumberFormatter'

export function useSharedBigNumberFormatter(
  value: ComputedRef<string | number | BigNumberInBase>,
  options: {
    decimalPlaces?: number | ComputedRef<number>
    minimalDecimalPlaces?: number | ComputedRef<number>
    abbreviationFloor?: number // Whether to abbreviate numbers, e.g., 1,234,455 => 1M
    injFee?: number
    roundingMode?: BigNumber.RoundingMode
    displayAbsoluteDecimalPlace?: boolean // Explained above
    shouldTruncate?: boolean
  } = {}
) {
  const roundingMode = options.roundingMode || DEFAULT_ROUNDING_MODE
  const decimalPlaces = computed(
    () => toValue(options.decimalPlaces) ?? DEFAULT_BIG_NUMBER_DECIMAL_PLACES
  )

  const injFee = options.injFee ?? INJ_REQUIRED_FOR_GAS

  const valueToBigNumber = computed(() =>
    convertToBigNumber(value.value)
  )

  const valueToFixed = computed(() =>
    convertValueToFixed({
      valueToBigNumber: valueToBigNumber.value,
      options,
      decimalPlaces: decimalPlaces.value,
      roundingMode
    })
  )

  const valueToString = computed(() =>
    convertValueToString({
      valueToBigNumber: valueToBigNumber.value,
      options,
      decimalPlaces: decimalPlaces.value,
      roundingMode
    })
  )

  const valueWithGasBuffer = computed(() =>
    computeValueWithGasBuffer(valueToBigNumber.value, injFee)
  )

  const valueWithGasBufferToFixed = computed(() =>
    computeValueWithGasBufferToFixed({
      valueWithGasBuffer: valueWithGasBuffer.value,
      decimalPlaces: decimalPlaces.value,
      roundingMode
    })
  )

  const valueWithGasBufferToString = computed(() =>
    computeValueWithGasBufferToString({
      valueWithGasBuffer: valueWithGasBuffer.value,
      options,
      decimalPlaces: decimalPlaces.value,
      roundingMode
    })
  )

  return {
    valueToFixed,
    valueToString,
    valueToBigNumber,
    valueWithGasBuffer,
    valueWithGasBufferToFixed,
    valueWithGasBufferToString
  }
}
