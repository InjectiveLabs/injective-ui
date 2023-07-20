<script lang="ts" setup>
import { PasteEvent } from './../types'

const props = defineProps({
  clearOnPaste: Boolean,

  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  paste: []
  input: [value: string]
  'update:modelValue': [state: string]
}>()

function onPaste(payload: ClipboardEvent) {
  const event = payload as PasteEvent<HTMLInputElement>
  const { clipboardData } = event

  event.preventDefault()

  if (clipboardData) {
    const value = clipboardData.getData('text')
    const updatedValue = props.clearOnPaste
      ? value
      : `${props.modelValue}${value.trim()}`

    emit('update:modelValue', updatedValue)
    emit('input', updatedValue)
    emit('paste')
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
    class="input-base"
    v-bind="$attrs"
    :value="modelValue"
    @input="onChange"
    @paste="onPaste"
  />
</template>
