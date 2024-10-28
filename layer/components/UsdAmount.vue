<script lang="ts" setup>
import { BigNumber } from '@injectivelabs/utils'

const props = withDefaults(
  defineProps<{
    amount: string
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

  if (!decimalPlaces) {
    return 2
  }

  return Math.min(
    decimalPlaces,
    amountInBigNumber.toPrecision(2).split('.')[1]?.length || 0
  )
})

const { valueToFixed: usdAmountToFixed } = useSharedBigNumberFormatter(
  computed(() => props.amount),
  {
    shouldTruncate: true,
    decimalPlaces: decimals.value,
    roundingMode: BigNumber.ROUND_HALF_UP,
    minimalDecimalPlaces: decimals.value
  }
)
</script>

<template>
  <SharedAmountCollapsed
    v-bind="{
      ...$attrs,
      amount: usdAmountToFixed
    }"
  />
</template>
