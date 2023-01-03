<script lang="ts" setup>
import { PasteEvent } from './../types'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', state: string): void
  (e: 'blur', value: string): void
  (e: 'input', value: string): void
  (e: 'focus'): void
}>()

function onPaste(payload: ClipboardEvent) {
  const event = payload as PasteEvent<HTMLInputElement>
  const { clipboardData } = event

  event.preventDefault()

  if (clipboardData) {
    const value = clipboardData.getData('text')
    const updatedValue = `${props.modelValue}${value.trim()}`

    emit('update:modelValue', updatedValue)
    emit('input', updatedValue)
  }
}

function onFocus() {
  emit('focus')
}

function onBlur(event: any) {
  const { value } = event.target

  emit('blur', value)
}

function onChange(event: any) {
  const { value } = event.target

  emit('update:modelValue', value)
  emit('input', value)
}
</script>

<template>
  <input
    class="input"
    :value="modelValue"
    @blur="onBlur"
    @focus="onFocus"
    @input="onChange"
    @paste="onPaste"
  />
</template>
