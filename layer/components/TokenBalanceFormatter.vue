<script lang="ts" setup>
import { computed, PropType } from 'vue'
import { BigNumber } from '@injectivelabs/utils'
import { TokenStatic } from '@injectivelabs/token-metadata'
import { sharedToBalanceInToken } from './../utils/formatter'

const props = defineProps({
  shouldTruncate: Boolean,

  amount: {
    type: [String, Number],
    required: true
  },

  decimalPlaces: {
    type: Number,
    required: true
  },

  token: {
    type: Object as PropType<TokenStatic>,
    required: true
  }
})

const condensedZeroCount = computed(() => {
  if (!fullAmountToString.value.startsWith('0.0')) {
    return 0
  }

  let condensedCount = 0

  for (const num of fullAmountToString.value.replace('0.', '')) {
    if (num !== '0') {
      break
    }

    condensedCount++
  }

  return condensedCount
})

const { valueToBigNumber: amountInTokenToBigNumber } =
  useSharedBigNumberFormatter(
    computed(() =>
      sharedToBalanceInToken({
        value: props.amount,
        decimalPlaces: props.token.decimals
      })
    )
  )

const dustAmount = computed(() => {
  return amountInTokenToString.value.replace(
    `0.${'0'.repeat(condensedZeroCount.value)}`,
    ''
  )
})

const displayDecimals = computed(() => {
  if (amountInTokenToBigNumber.value.eq(0)) {
    return props.decimalPlaces
  }

  return props.decimalPlaces + condensedZeroCount.value
})

const { valueToString: fullAmountToString } = useSharedBigNumberFormatter(
  computed(() => amountInTokenToBigNumber.value),
  {
    decimalPlaces: computed(() => props.token.decimals),
    minimalDecimalPlaces: computed(() => props.token.decimals)
  }
)

const { valueToString: amountInTokenToString } = useSharedBigNumberFormatter(
  computed(() => amountInTokenToBigNumber.value),
  {
    decimalPlaces: displayDecimals.value,
    shouldTruncate: props.shouldTruncate,
    roundingMode: BigNumber.ROUND_HALF_UP,
    minimalDecimalPlaces: displayDecimals.value
  }
)
</script>

<template>
    <slot v-bind="{
        dustAmount,
        displayDecimals,
        condensedZeroCount,
        fullAmountToString,
        amountInTokenToString,
        amountInTokenToBigNumber,
      }"
    />
</template>
