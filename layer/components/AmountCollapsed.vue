<script lang="ts" setup>
import { computed } from 'vue'
import { BigNumber } from '@injectivelabs/utils'
import { sharedGetExactDecimalsFromNumber } from '../utils/formatter'

const props = defineProps({
  shouldTruncate: Boolean,

  amount: {
    type: String,
    required: true
  },

  maxTrailingZeros: {
    type: Number,
    default: 1
  }
})

const { valueToString: amountToString } = useSharedBigNumberFormatter(
  computed(() => props.amount),
  {
    decimalPlaces: computed(() =>
      sharedGetExactDecimalsFromNumber(props.amount, true)
    ),
    roundingMode: BigNumber.ROUND_DOWN,
    minimalDecimalPlaces: computed(() =>
      sharedGetExactDecimalsFromNumber(props.amount, true)
    )
  }
)

const amountWithoutTrailingZeros = computed(() => {
  if (!props.shouldTruncate) {
    return amountToString.value
  }

  if (!amountToString.value.includes('.')) {
    return amountToString.value
  }

  return amountToString.value
    .replace(/(\.\d*?[1-9])0+$/, '$1')
    .replace(/\.0+$/, '')
})

const maxTrailingZeros = computed(
  () => `0.${'0'.repeat(props.maxTrailingZeros)}`
)

const { valueToBigNumber: amountInBigNumber } = useSharedBigNumberFormatter(
  computed(() => amountToString.value)
)

const condensedZeroCount = computed(() => {
  if (!amountWithoutTrailingZeros.value.startsWith(maxTrailingZeros.value)) {
    return 0
  }

  let condensedCount = 0

  for (const num of amountWithoutTrailingZeros.value.replace('0.', '')) {
    if (num !== '0') {
      break
    }

    condensedCount++
  }

  return condensedCount
})

const dustAmount = computed(() =>
  amountWithoutTrailingZeros.value.replace(
    `0.${'0'.repeat(condensedZeroCount.value)}`,
    ''
  )
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
      {{ amountWithoutTrailingZeros }}
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
