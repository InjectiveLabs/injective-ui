<script setup lang="ts">
import type { BigNumberInBase } from "@injectivelabs/utils";

withDefaults(
  defineProps<{
    amount: string | number | BigNumberInBase;
    showSign?: boolean;
  }>(),
  {
    showSign: true,
  },
);
</script>

<template>
  <span>
    <span v-if="showSign">$ </span>
    <SharedAmountDisplay :amount="amount" :decimals="2" use-abbreviation />
  </span>
</template>
