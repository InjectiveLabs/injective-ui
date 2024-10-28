<script lang="ts" setup>
import { BigNumber } from '@injectivelabs/utils'

const props = withDefaults(
  defineProps<{
    amount: string
    shouldTruncate?: boolean
    isShowNoDecimals?: boolean
  }>(),
  {}
)

const decimals = computed(() => {
  if (props.isShowNoDecimals) {
    return 0
  }

  const amountInBigNumber = new BigNumber(props.amount)
  const decimalPlaces = amountInBigNumber.decimalPlaces()

  if (!decimalPlaces || amountInBigNumber.gt(0.1)) {
    return 2
  }

  return Math.min(
    decimalPlaces,
    amountInBigNumber.toPrecision(2).split('.')[1]?.length || 0
  )
})

const {
  valueToFixed: usdAmountToFixed,
  valueToBigNumber: usdAmountToBigNumber
} = useSharedBigNumberFormatter(
  computed(() => props.amount),
  {
    decimalPlaces: decimals.value,
    roundingMode: BigNumber.ROUND_HALF_UP,
    minimalDecimalPlaces: decimals.value
  }
)

const shouldTruncateUsdAmount = computed(() => {
  if (props.shouldTruncate) {
    return true
  }

  return (
    usdAmountToBigNumber.value.lt(0.01) && usdAmountToFixed.value.endsWith('0')
  )
})
</script>

<template>
  <SharedAmountCollapsed
    v-bind="{
      ...$attrs,
      amount: usdAmountToFixed,
      shouldTruncate: shouldTruncateUsdAmount
    }"
  />
</template>
