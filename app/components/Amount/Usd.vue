<script lang="ts" setup>
import { BigNumber } from '@injectivelabs/utils'
import { DEFAULT_USD_DECIMALS } from '../../utils/constant'

withDefaults(
  defineProps<{
    dataCy?: string
    cyValue?: string
    hideDecimals?: boolean
    useSubscript?: boolean
    shouldAbbreviate?: boolean
    amount: string | number | BigNumber
    roundingMode?: BigNumber.RoundingMode
  }>(),
  {
    dataCy: '',
    cyValue: '',
    shouldAbbreviate: true,
    roundingMode: BigNumber.ROUND_DOWN
  }
)
</script>

<template>
  <SharedAmountBase
    v-bind="{
      amount,
      dataCy,
      cyValue,
      useSubscript,
      roundingMode,
      shouldAbbreviate,
      decimals: hideDecimals ? 0 : DEFAULT_USD_DECIMALS
    }"
  >
    <template #prefix>
      <slot name="prefix" />
    </template>
  </SharedAmountBase>
</template>
