<script lang="ts" setup>
import { BigNumberInBase } from '@injectivelabs/utils';
import { computed } from 'vue'
import { useSharedBigNumberFormatter } from '~/composables/useSharedBigNumberFormatted';

const props = defineProps({
  amount: {
    type: String,
    required: true
  },

  decimalPlaces: {
    type: Number,
    required: true
  },

  maxDecimalPlaces: {
    type: Number,
    default: ''
  }
})


const { valueToBigNumber: amountInBigNumber, valueToString: amountToString } = useSharedBigNumberFormatter(
  computed(() => props.amount),
  {
    decimalPlaces: props.decimalPlaces,
    minimalDecimalPlaces: props.decimalPlaces
  }
)

const condensedZeroCount = computed(() => {
  if (!props.amount.startsWith('0.0')) {
    return 0
  }

  let condensedCount = 0

  for (const num of props.amount.replace('0.', '')) {
    if (num !== '0') {
      break
    }

    condensedCount++
  }

  return condensedCount
})

const dustAmount = computed(() => {
  return props.amount.replace(
    `0.${'0'.repeat(condensedZeroCount.value)}`,
    ''
  )
})

const slicedDustAmount = computed(() => {
  return dustAmount.value.slice(0, displayDecimals.value)
})

const displayDecimals = computed(() => {
  if (amountInBigNumber.value.eq(0)) {
    return props.decimalPlaces
  }

  if (props.maxDecimalPlaces) {
    return props.maxDecimalPlaces - condensedZeroCount.value
  }

  return props.decimalPlaces
})
</script>

<template>
  <slot
    v-bind="{
      dustAmount,
      displayDecimals,
      condensedZeroCount
    }"
  >
    <span
      v-if="
        amountInBigNumber.eq(0) ||
        amountInBigNumber.gt(1) ||
        Number(condensedZeroCount) <= 1
      "
    >
      {{ amountToString }}
    </span>

    <span v-else>
      <span class="flex items-center">
        0.0
        <sub>
          {{ condensedZeroCount }}
        </sub>
        {{ slicedDustAmount }}
      </span>
    </span>
  </slot>
</template>
