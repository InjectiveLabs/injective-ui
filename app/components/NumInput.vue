<script setup lang="ts">
import { useIMask } from 'vue-imask'
import { toBigNumber } from '@injectivelabs/utils'
import { createIMaskConfig } from '@shared/utils/iMask'

const props = withDefaults(
  defineProps<{
    max?: number
    min?: number
    isAutofix?: boolean
    isShowMask?: boolean
    maxDecimals?: number
    modelValue?: string | number
  }>(),
  {
    max: undefined,
    min: undefined,
    modelValue: '',
    maxDecimals: 6
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { el, typed } = useIMask(
  computed(() =>
    createIMaskConfig({
      scale: props.maxDecimals,
      min: props.min,
      max: props.max,
      autofix: props.isAutofix,
      thousandsSeparator: props.isShowMask ? ',' : ''
    })
  ),
  {
    onAccept: (e) => {
      if (e?.inputType === undefined) {
        return
      }

      emit('update:modelValue', `${typed.value}`)
    }
  }
)

function onPaste(e: ClipboardEvent) {
  if (!e.clipboardData) {
    return
  }

  e.preventDefault()

  const text = e.clipboardData.getData('text/plain').replaceAll(',', '')
  const value = toBigNumber(text).toFixed(props.maxDecimals)

  typed.value = value
  emit('update:modelValue', `${typed.value}`)
}

watch(
  () => props.modelValue,
  (value) => {
    nextTick(() => (typed.value = value))
  },
  { immediate: true }
)
</script>

<template>
  <input
    ref="el"
    type="text"
    class="input-base"
    v-bind="$attrs"
    @paste="onPaste"
  />
</template>
