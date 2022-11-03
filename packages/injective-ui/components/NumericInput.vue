<script lang="ts" setup>
import { useDebounceFn } from '@vueuse/core'
import {
  convertToNumericValue,
  passNumericInputValidation
} from './../lib/utils/input'
import { KeydownEvent, PasteEvent } from './../lib/types'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  maxDecimals: {
    type: Number,
    default: 6
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', state: string): void
  (e: 'blur'): void
  (e: 'focus'): void
}>()

const debounceSanitizeDecimalPlace = useDebounceFn((value: string) => {
  const formattedValue = convertToNumericValue(
    value,
    props.maxDecimals
  ).toString()

  emit('update:modelValue', formattedValue)
}, 500)

function onFocus() {
  emit('focus')
}

function onBlur() {
  emit('blur')
}

function onKeyDown(payload: KeyboardEvent) {
  const event = payload as KeydownEvent<HTMLInputElement>

  if (
    !passNumericInputValidation(event, props.maxDecimals === 0 ? ['.'] : [])
  ) {
    event.preventDefault()
  }
}

function onPaste(payload: ClipboardEvent) {
  const event = payload as PasteEvent<HTMLInputElement>
  const { clipboardData } = event

  event.preventDefault()

  if (clipboardData) {
    const value = clipboardData.getData('text')
    const formattedValue = convertToNumericValue(value, props.maxDecimals)

    emit('update:modelValue', `${formattedValue}`)
  }
}

function onChange(event: any) {
  const { value } = event.target

  emit('update:modelValue', value)
  debounceSanitizeDecimalPlace(value)
}
</script>

<template>
  <input
    class="input"
    type="number"
    v-bind="$attrs"
    :value="modelValue"
    @blur="onBlur"
    @focus="onFocus"
    @input="onChange"
    @paste="onPaste"
    @keydown="onKeyDown"
  />
</template>
