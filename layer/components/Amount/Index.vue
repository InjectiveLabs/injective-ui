<script setup lang="ts">
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import {
  DEFAULT_ASSET_DECIMALS,
  DEFAULT_ABBREVIATED_DECIMALS,
  DEFAULT_ABBREVIATION_THRESHOLD
} from '../../utils/constant'

const props = withDefaults(
  defineProps<{
    decimals?: number
    useSubscript?: boolean
    noTrailingZeros?: boolean
    shouldAbbreviate?: boolean
    showZeroAsEmDash?: boolean
    abbreviationThreshold?: number
    roundingMode?: BigNumber.RoundingMode
    amount: string | number | BigNumberInBase
  }>(),
  {
    useSubscript: true,
    noTrailingZeros: true,
    shouldAbbreviate: true,
    roundingMode: BigNumber.ROUND_DOWN,
    decimals: DEFAULT_ASSET_DECIMALS,
    abbreviationThreshold: DEFAULT_ABBREVIATION_THRESHOLD
  }
)

const decimals = computed(() => {
  if (
    !!props.abbreviationThreshold &&
    new BigNumberInBase(props.amount || 0).gt(props.abbreviationThreshold)
  ) {
    return DEFAULT_ABBREVIATED_DECIMALS
  }

  return props.decimals
})
</script>

<template>
  <SharedAmountBase
    v-bind="{
      amount,
      decimals,
      roundingMode,
      useSubscript,
      noTrailingZeros,
      shouldAbbreviate,
      showZeroAsEmDash,
      abbreviationThreshold
    }"
  >
    <template #prefix>
      <slot name="prefix" />
    </template>
  </SharedAmountBase>
</template>
