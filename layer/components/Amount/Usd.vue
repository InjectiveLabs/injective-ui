<script setup lang="ts">
import type { BigNumberInBase } from '@injectivelabs/utils'

withDefaults(
  defineProps<{
    shouldAbbreviate?: boolean
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
        shouldAbbreviate
      }"
    >
      <template #prefix>
        <slot name="prefix" />
      </template>
    </SharedAmountBase>
  </span>
</template>
