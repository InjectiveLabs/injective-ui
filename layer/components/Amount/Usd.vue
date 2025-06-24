<script setup lang="ts">
import { BigNumber } from '@injectivelabs/utils'
import type { BigNumberInBase } from '@injectivelabs/utils'

withDefaults(
  defineProps<{
    shouldAbbreviate?: boolean
    roundingMode?: BigNumber.RoundingMode
    amount: string | number | BigNumberInBase
  }>(),
  {
    shouldAbbreviate: true,
    roundingMode: BigNumber.ROUND_DOWN
  }
)
</script>

<template>
  <SharedAmountBase
    v-bind="{
      amount,
      decimals: 2,
      roundingMode,
      shouldAbbreviate
    }"
  >
    <template #prefix>
      <slot name="prefix" />
    </template>
  </SharedAmountBase>
</template>
