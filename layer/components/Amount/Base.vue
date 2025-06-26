<script setup lang="ts">
import { abbreviateNumber } from '../../utils/helper'
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { DEFAULT_ABBREVIATION_THRESHOLD } from '../../utils/constant'

const props = withDefaults(
  defineProps<{
    decimals?: number
    useSubscript?: boolean
    noTrailingZeros?: boolean
    subscriptDecimals?: number
    shouldAbbreviate?: boolean
    showZeroAsEmDash?: boolean
    abbreviationThreshold?: number
    subscriptThresholdDecimals?: number
    roundingMode?: BigNumber.RoundingMode
    amount: string | number | BigNumberInBase
  }>(),
  {
    decimals: 8,
    subscriptDecimals: 4,
    subscriptThresholdDecimals: 3,
    roundingMode: BigNumber.ROUND_DOWN,
    abbreviationThreshold: DEFAULT_ABBREVIATION_THRESHOLD
  }
)

const amountToBigNumber = computed(() => new BigNumberInBase(props.amount || 0))
const isNegative = computed(() => amountToBigNumber.value.lt(0))
const absoluteAmount = computed(() => amountToBigNumber.value.abs())

const minDecimalThreshold = computed(() =>
  new BigNumberInBase(1).div(Math.pow(10, props.decimals))
)

const shouldHaveSmallerThan = computed(() => {
  const amount = absoluteAmount.value
  const nIsLowerThanDecimalThreshold = amount.lt(minDecimalThreshold.value)

  return nIsLowerThanDecimalThreshold && amount.gt(0)
})

const abbreviatedAmount = computed(() => {
  if (!props.shouldAbbreviate) {
    return false
  }

  const amount = absoluteAmount.value

  const nIsBiggerThanThreshold = amount.gte(props.abbreviationThreshold)

  if (!!props.abbreviationThreshold && nIsBiggerThanThreshold) {
    return abbreviateNumber(amount.toNumber())
  }

  return false
})

const subscriptedAmount = computed(() => {
  const [integerPart, decimalPart] = absoluteAmount.value.toFixed().split('.')

  if (!decimalPart || !props.useSubscript || absoluteAmount.value.gte(1)) {
    return false
  }

  let nOfZeros = 0

  for (let i = 0; i < decimalPart.length; i++) {
    if (decimalPart[i] === '0') {
      nOfZeros++
    } else {
      break
    }
  }

  if (
    nOfZeros > props.subscriptThresholdDecimals ||
    nOfZeros > props.decimals
  ) {
    const subscriptAmount = new BigNumberInBase(decimalPart.replace(/^0+/, ''))
      .toFixed(0)
      .slice(0, props.subscriptDecimals)

    const integerAmount = new BigNumberInBase(integerPart).toFormat(0)

    return integerAmount + '.0<sub>' + nOfZeros + '</sub>' + subscriptAmount
  }

  return false
})

const formattedAmount = computed(() => {
  const amount = absoluteAmount.value

  if (props.noTrailingZeros && props.decimals > 0) {
    const result = amount
      .toFormat(props.decimals, props.roundingMode)
      .replace(/(\.\d*?[1-9])0+$/g, '$1')
      .replace(/\.0+$/, '')

    return result || '0'
  }

  const formattedAmount = amount.toFormat(props.decimals, props.roundingMode)

  return formattedAmount
})
</script>

<template>
  <span v-if="isNegative">-</span>
  <slot name="prefix" />

  <span v-if="showZeroAsEmDash && amountToBigNumber.eq(0)"> &mdash; </span>
  <span v-else-if="subscriptedAmount" v-html="subscriptedAmount"></span>
  <span v-else-if="shouldHaveSmallerThan">
    &lt;{{ minDecimalThreshold.toFormat() }}
  </span>
  <span v-else-if="abbreviatedAmount">
    {{ abbreviatedAmount }}
  </span>
  <span v-else>{{ formattedAmount }}</span>
</template>
