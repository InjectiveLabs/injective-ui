<script lang="ts" setup>
import { PasteEvent } from './../types'

const props = defineProps({
  isClearedOnPaste: Boolean,

  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  pasted: []
  'input:changed': [value: string]
  'update:modelValue': [state: string]

  // Legacy
  paste: []
  input: [value: string]
}>()

function onPaste(payload: ClipboardEvent) {
  const event = payload as PasteEvent<HTMLInputElement>
  const { clipboardData } = event

  event.preventDefault()

  if (clipboardData) {
    const value = clipboardData.getData('text')
    const updatedValue = props.isClearedOnPaste
      ? value
      : `${props.modelValue}${value.trim()}`

    emit('update:modelValue', updatedValue)
    emit('input:changed', updatedValue)
    emit('pasted')

    // Legacy
    emit('paste')
  }
}

function onChange(event: any) {
  const { value } = event.target

  emit('update:modelValue', value)
  emit('input:changed', value)

  // Legacy
  emit('input', value)
}
</script>

<template>
  <input
    class="input-base"
    v-bind="$attrs"
    :value="modelValue"
    @input="onChange"
    @paste="onPaste"
  />
</template>
