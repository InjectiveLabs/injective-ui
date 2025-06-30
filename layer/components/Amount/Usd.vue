<script setup lang="ts">
import { BigNumber, type BigNumberInBase } from '@injectivelabs/utils'
import { DEFAULT_USD_DECIMALS } from '../../utils/constant'

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
      roundingMode,
      shouldAbbreviate,
      decimals: DEFAULT_USD_DECIMALS
    }"
  >
    <template #prefix>
      <slot name="prefix" />
    </template>
  </SharedAmountBase>
</template>
