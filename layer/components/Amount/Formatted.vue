<script setup lang="ts">
import { BigNumberInBase } from "@injectivelabs/utils";

const props = withDefaults(
  defineProps<{
    amount: string | number | BigNumberInBase;
    decimals?: number;
    noTrailingZeros?: boolean;
  }>(),
  {
    decimals: 6,
    noTrailingZeros: true,
  },
);

const decimals = computed(() => {
  if (new BigNumberInBase(props.amount || 0).gt(1_000_000)) {
    return 2;
  }

  return props.decimals;
});
</script>

<template>
  <SharedAmountDisplay
    v-bind="{
      amount,
      decimals,
      useSubscript: true,
      noTrailingZeros,
    }"
  />
</template>
