<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
  amount: {
    type: String,
    required: true
  },

  maxTrailingZeros: {
    type: Number,
    default: 1
  }
})

const maxTrailingZeros = computed(() => {
  return `0.${'0'.repeat(props.maxTrailingZeros)}`
})

const { valueToBigNumber: amountInBigNumber, valueToString: amountToString } =
  useSharedBigNumberFormatter(computed(() => props.amount))

const condensedZeroCount = computed(() => {
  if (!props.amount.startsWith(maxTrailingZeros.value)) {
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

const dustAmount = computed(() =>
  props.amount.replace(`0.${'0'.repeat(condensedZeroCount.value)}`, '')
)
</script>

<template>
  <slot
    v-bind="{
      dustAmount,
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
        {{ dustAmount }}
      </span>
    </span>
  </slot>
</template>
