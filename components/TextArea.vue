<script lang="ts" setup>
import type { PasteEvent } from '../types'

defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },

  rows: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits<{
  'textArea:blurred': []
  'textArea:focused': []
  'update:modelValue': [state: string]
}>()

function onBlur() {
  emit('textArea:blurred')
}

function onFocus() {
  emit('textArea:focused')
}

function onChange(event: any) {
  const { value } = event.target

  emit('update:modelValue', value)
}

function onPaste(payload: ClipboardEvent) {
  const event = payload as PasteEvent<HTMLInputElement>
  const { clipboardData } = event

  event.preventDefault()

  if (clipboardData) {
    const value = clipboardData.getData('text')

    emit('update:modelValue', value.trim())
  }
}
</script>

<template>
  <textarea
    class="textarea"
    v-bind="$attrs"
    :rows="rows"
    :value="modelValue"
    @blur="onBlur"
    @focus="onFocus"
    @input="onChange"
    @paste="onPaste"
  />
</template>
