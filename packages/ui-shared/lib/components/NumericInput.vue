<script lang="ts" setup>
import { useDebounceFn } from '@vueuse/core'
import {
  convertToNumericValue,
  passNumericInputValidation,
  stripNonDigits
} from './../utils/input'
import { KeydownEvent, PasteEvent } from './../types'

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
  (e: 'input', value: string): void
  (e: 'blur', value: string): void
  (e: 'focus'): void
}>()

const debounceSanitizeDecimalPlace = useDebounceFn((value: string) => {
  const formattedValue = convertToNumericValue(
    value,
    props.maxDecimals
  ).toString()

  emit('update:modelValue', formattedValue)
  emit('input', formattedValue)
}, 500)

function onFocus() {
  emit('focus')
}

function onBlur(event: any) {
  const { value } = event.target

  emit('blur', value)
}

function onWheel(event: WheelEvent) {
  event.preventDefault()
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
    const digitOnlyValue = stripNonDigits(value).toString()
    const formattedValue = convertToNumericValue(
      digitOnlyValue,
      props.maxDecimals
    )

    emit('update:modelValue', `${formattedValue}`)
    emit('input', `${formattedValue}`)
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
    @wheel="onWheel"
  />
</template>
