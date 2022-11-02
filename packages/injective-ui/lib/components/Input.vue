<script lang="ts" setup>
import { PasteEvent, KeydownEvent } from './../types'

defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', state: string): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'keydown', event: KeydownEvent<HTMLInputElement>): void
}>()

function onPaste(payload: ClipboardEvent) {
  const event = payload as PasteEvent<HTMLInputElement>
  const { clipboardData } = event

  event.preventDefault()

  if (clipboardData) {
    const value = clipboardData.getData('text')

    emit('update:modelValue', value.trim())
  }
}

function onFocus() {
  emit('focus')
}

function onBlur() {
  emit('blur')
}

function handleKeydown(payload: KeyboardEvent) {
  const event = payload as KeydownEvent<HTMLInputElement>

  emit('keydown', event)
}

function onChange(event: any) {
  const { value } = event.target

  emit('update:modelValue', value)
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
    @keydown="handleKeydown"
  />
</template>
