<script setup lang="ts">
import type { BigNumberInBase } from '@injectivelabs/utils'

withDefaults(
  defineProps<{
    prefix?: string
    shouldAbbreviate?: boolean
    abbreviationThreshold?: number
    amount: string | number | BigNumberInBase
  }>(),
  {}
)
</script>

<template>
  <span>
    <SharedAmountBase
      v-bind="{
        amount,
        decimals: 2,
        shouldAbbreviate,
        abbreviationThreshold
      }"
    >
      <template #prefix>
        <slot name="prefix" />
      </template>
    </SharedAmountBase>
  </span>
</template>
