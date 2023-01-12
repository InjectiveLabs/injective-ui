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
  (e: 'input', value: string): void
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

function onChange(event: any) {
  const { value } = event.target

  emit('update:modelValue', value)
  emit('input', value)
}
</script>

<template>
  <input
    class="input"
    v-bind="$attrs"
    :value="modelValue"
    @input="onChange"
    @paste="onPaste"
  />
</template>
