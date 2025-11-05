<script setup lang="ts">
import type { TokenStatic } from '@injectivelabs/sdk-ts'

const props = withDefaults(
  defineProps<{
    tokens: TokenStatic[]
    modelValue?: string
    showDenom?: boolean
  }>(),
  { modelValue: undefined }
)

const formattedTokens = computed(() =>
  props.tokens.map((token) => ({
    id: token.denom,
    label: `${token.symbol} (${token.name})`,
    avatar: {
      src: token.logo
    },
    denom: token.denom,
    symbol: token.symbol,
    name: token.name
  }))
)

// const emit = defineEmits<{
//   'update:modelValue': [value: string]
// }>()

const selected = ref([formattedTokens.value[3]])
</script>

<template>
  <UCommandPalette
    v-model="selected"
    :groups="[{ id: 'tokens', items: formattedTokens }]"
  />
</template>
