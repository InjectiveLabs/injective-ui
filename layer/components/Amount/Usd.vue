<script lang="ts" setup>
import { DEFAULT_USD_DECIMALS } from '../../utils/constant'
import { BigNumber, type BigNumberInBase } from '@injectivelabs/utils'

withDefaults(
  defineProps<{
    hideDecimals?: boolean
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
      useSubscript: false,
      decimals: hideDecimals ? 0 : DEFAULT_USD_DECIMALS
    }"
  >
    <template #prefix>
      <slot name="prefix" />
    </template>
  </SharedAmountBase>
</template>
