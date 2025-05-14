<script setup lang="ts">
import { BigNumberInBase } from "@injectivelabs/utils";

const props = withDefaults(
  defineProps<{
    amount: string | number | BigNumberInBase;
    decimals?: number;
    useSubscript?: boolean;
    useAbbreviation?: boolean;
    abbreviationThreshold?: number;
    noTrailingZeros?: boolean;
    subscriptThresholdDecimals?: number;
    subscriptDecimals?: number;
  }>(),
  {
    decimals: 6,
    useSubscript: false,
    useAbbreviation: false,
    abbreviationThreshold: 1_000_000,
    noTrailingZeros: false,
    subscriptThresholdDecimals: 4,
    subscriptDecimals: 4,
  },
);

function abbreviateNumber(num: number, decimals: number = 2): string {
  const suffixes = ["", "K", "M", "B", "T", "Q", "R", "S", "D", "N"];
  const tier = (Math.log10(Math.abs(num)) / 3) | 0;
  const suffix = suffixes[tier];
  const scale = Math.pow(10, tier * 3);

  const scaled = num / scale;
  return scaled.toFixed(decimals) + (suffix || "");
}

const abbreviatedAmount = computed(() => {
  const amount = new BigNumberInBase(props.amount || 0);

  const nIsBiggerThanThreshold = amount.gte(props.abbreviationThreshold);

  const minDecimalThreshold = new BigNumberInBase(1).div(
    Math.pow(10, props.decimals),
  );

  const nIsLowerThanDecimalThreshold = amount.lt(minDecimalThreshold);

  if (props.useAbbreviation && nIsBiggerThanThreshold) {
    return "~" + abbreviateNumber(Number(props.amount || 0));
  }

  if (props.useAbbreviation && nIsLowerThanDecimalThreshold && amount.gt(0)) {
    return "<" + minDecimalThreshold.toFormat();
  }

  return false;
});

const subscriptedAmount = computed(() => {
  const [integerPart, decimalPart] = new BigNumberInBase(props.amount || 0)
    .toFixed()
    .split(".");

  if (!decimalPart || !props.useSubscript) {
    return false;
  }

  let nOfZeros = 0;

  for (let i = 0; i < decimalPart.length; i++) {
    if (decimalPart[i] === "0") {
      nOfZeros++;
    } else {
      break;
    }
  }

  if (nOfZeros > props.subscriptThresholdDecimals) {
    const subscriptAmount = new BigNumberInBase(decimalPart.replace(/^0+/, ""))
      .toFixed(0)
      .slice(0, props.subscriptDecimals);

    const integerAmount = new BigNumberInBase(integerPart).toFormat(0);

    return integerAmount + ".0<sub>" + nOfZeros + "</sub>" + subscriptAmount;
  }

  return false;
});

const formattedAmount = computed(() => {
  const amount = new BigNumberInBase(props.amount || 0);

  if (props.noTrailingZeros) {
    return amount.toFormat(props.decimals).replace(/\.?0+$/, "");
  }

  const formattedAmount = amount.toFormat(props.decimals);

  return formattedAmount;
});
</script>
<template>
  <span v-if="abbreviatedAmount">{{ abbreviatedAmount }}</span>
  <span v-else-if="subscriptedAmount" v-html="subscriptedAmount"></span>
  <span v-else>{{ formattedAmount }}</span>
</template>
