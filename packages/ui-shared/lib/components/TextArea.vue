<script lang="ts" setup>
import { PasteEvent } from './../types'

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
  blur: []
  focus: []
  'update:modelValue': [state: string]
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

function onChange(event: any) {
  const { value } = event.target

  emit('update:modelValue', value)
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
