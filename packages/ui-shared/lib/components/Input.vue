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
  (e: 'blur'): void
  (e: 'focus'): void
}>()

function onPaste(payload: ClipboardEvent) {
  const event = payload as PasteEvent<HTMLInputElement>
  const { clipboardData } = event

  event.preventDefault()

  if (clipboardData) {
    const value = clipboardData.getData('text')

    emit('update:modelValue', `${props.modelValue}${value.trim()}`)
  }
}

function onFocus() {
  emit('focus')
}

function onBlur() {
  emit('blur')
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
  />
</template>
