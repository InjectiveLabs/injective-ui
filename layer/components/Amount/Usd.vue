<script setup lang="ts">
import type { BigNumberInBase } from "@injectivelabs/utils";
import { DEFAULT_ABBREVIATION_THRESHOLD } from "../../utils/constant";

withDefaults(
  defineProps<{
    showSign?: boolean;
    abbreviationThreshold?: number;
    amount: string | number | BigNumberInBase;
  }>(),
  {
    showSign: true,
    abbreviationThreshold: DEFAULT_ABBREVIATION_THRESHOLD,
  },
);
</script>

<template>
  <span>
    <SharedAmountBase
      v-bind="{
        amount,
        decimals: 2,
        abbreviationThreshold,
      }"
    >
      <template #prefix>
        <span v-if="showSign">$ </span>
      </template>
    </SharedAmountBase>
  </span>
</template>
