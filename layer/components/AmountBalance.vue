<script lang="ts" setup>
import { computed } from 'vue'
import { BigNumber } from '@injectivelabs/utils'

const props = withDefaults(
  defineProps<{
    amount: string
    decimalPlaces?: number
    showZeroAsEmDash?: boolean
  }>(),
  {
    decimalPlaces: 8
  }
)

const { valueToString: amountToString } = useSharedBigNumberFormatter(
  computed(() => props.amount),
  {
    abbreviationFloor: 1_000_000,
    roundingMode: BigNumber.ROUND_DOWN,
    decimalPlaces: computed(() => props.decimalPlaces),
    minimalDecimalPlaces: computed(() => props.decimalPlaces)
  }
)

const amountWithoutTrailingZeros = computed(() => {
  if (!amountToString.value.includes('.')) {
    return amountToString.value
  }

  return amountToString.value
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.0+$/, '')
})

const { valueToBigNumber: amountInBigNumber } = useSharedBigNumberFormatter(
  computed(() => amountToString.value)
)
</script>

<template>
  <span>
    <span v-if="showZeroAsEmDash && amountInBigNumber.eq(0)"> &mdash; </span>
    <span v-else>
      {{ amountWithoutTrailingZeros }}
    </span>
  </span>
</template>
