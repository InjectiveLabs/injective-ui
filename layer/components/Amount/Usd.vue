<script setup lang="ts">
import { DEFAULT_USD_DECIMALS } from '../../utils/constant'
import { BigNumber, type BigNumberInBase } from '@injectivelabs/utils'

withDefaults(
  defineProps<{
    hideDecimals?: boolean
    showSmallerThan?: boolean
    shouldAbbreviate?: boolean
    roundingMode?: BigNumber.RoundingMode
    amount: string | number | BigNumberInBase
  }>(),
  {
    showSmallerThan: true,
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
      showSmallerThan,
      shouldAbbreviate,
      decimals: hideDecimals ? 0 : DEFAULT_USD_DECIMALS
    }"
  >
    <template #prefix>
      <slot name="prefix" />
    </template>
  </SharedAmountBase>
</template>
