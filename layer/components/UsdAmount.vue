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
    roundingMode: BigNumber.ROUND_HALF_UP,
    decimalPlaces: computed(() => decimals.value),
    minimalDecimalPlaces: computed(() => decimals.value)
  }
)

const shouldTruncateUsdAmount = computed(() => {
  if (props.shouldTruncate) {
    return true
  }

  if (usdAmountToBigNumber.value.isZero() && !props.isShowNoDecimals) {
    return false
  }

  return (
    usdAmountToBigNumber.value.lt(0.01) && usdAmountToFixed.value.endsWith('0')
  )
})
</script>

<template>
  <SharedAmountCollapsed
    v-if="!usdAmountToBigNumber.gte(1_000_000)"
    v-bind="{
      ...$attrs,
      amount: usdAmountToFixed,
      shouldTruncate: shouldTruncateUsdAmount
    }"
  />
  <SharedAmountBalance
    v-else
    v-bind="{
      ...$attrs,
      amount: usdAmountToFixed
    }"
  />
</template>
