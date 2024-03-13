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
  pasted: [value: string]
  'input:changed': [value: string]
  'update:modelValue': [state: string]

  // Legacy
  paste: []
  input: [value: string]
}>()

function onPaste(payload: ClipboardEvent) {
  const event = payload as PasteEvent<HTMLInputElement>
  const { clipboardData } = event

  if (!clipboardData) {
    return
  }

  if (props.isClearedOnPaste) {
    const value = clipboardData.getData('text')
    event.preventDefault()

    // Legacy
    emit('paste')
    emit('pasted', value)
    emit('update:modelValue', value)

    return
  }

  // Legacy
  emit('paste')
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
    @paste="onPaste"
    @input="onChange"
  />
</template>
