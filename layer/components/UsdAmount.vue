<script lang="ts" setup>
import { getUsdDecimals } from '../utils/formatter'
import { BigNumber } from '@injectivelabs/utils'

const props = withDefaults(
  defineProps<{
    isShowNoDecimals?: boolean
    amount: string
  }>(),
  { isShowNoDecimals: false }
)

const decimals = computed(() => {
  if (props.isShowNoDecimals) {
    return 0
  }

  return getUsdDecimals(props.amount)
})

const { valueToFixed: usdAmountToFixed } = useSharedBigNumberFormatter(
  computed(() => props.amount),
  {
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
