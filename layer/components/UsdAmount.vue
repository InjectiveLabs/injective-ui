<script lang="ts" setup>
import { getUsdDecimals } from '@/utils/formatter'
import { BigNumber } from '@injectivelabs/utils'

const props = defineProps({
  isShowNoDecimals: Boolean,

  amount: {
    type: String,
    required: true
  }
})

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
    minimalDisplayDecimals: decimals.value
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
