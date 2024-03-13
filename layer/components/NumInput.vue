<script lang="ts" setup>
import { useDebounceFn } from '@vueuse/core'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  stripNonDigits,
  validateNumericInput,
  convertToNumericValue
} from './../utils/input'
import { KeydownEvent, PasteEvent } from './../types'

const props = defineProps({
  isShowMask: Boolean,

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
  'update:modelValue': [state: string]
}>()

const display = ref('')

const debounceSanitizeDecimalPlace = useDebounceFn((value: string) => {
  const formattedValue = convertToNumericValue(value, props.maxDecimals)

  if (Number.isNaN(formattedValue)) {
    return
  }

  display.value = formattedValue.toString()
  emit('update:modelValue', formattedValue.toString())
}, 500)

function onKeyDown(payload: KeyboardEvent) {
  const event = payload as KeydownEvent<HTMLInputElement>
  if (!validateNumericInput(event, props.maxDecimals === 0 ? ['.'] : [])) {
    event.preventDefault()
  }
}

function onPaste(payload: ClipboardEvent) {
  const event = payload as PasteEvent<HTMLInputElement>
  const { clipboardData } = event

  if (!clipboardData) {
    return
  }

  setTimeout(() => {
    const value = event.target.value.replace(/\D/g, '')
    const digitOnlyValue = stripNonDigits(value)

    const formattedValue = convertToNumericValue(
      digitOnlyValue.toString(),
      props.maxDecimals
    ).toString()

    event.target.value = formattedValue
    emit('update:modelValue', formattedValue)
  }, 0)
}

function onBlur() {
  if (!props.isShowMask || props.modelValue === '') {
    return
  }

  display.value = new BigNumberInBase(props.modelValue).toFormat()
}

function onFocus() {
  if (props.modelValue === '') {
    return
  }

  display.value = new BigNumberInBase(props.modelValue).toFixed()
}

function onChange(event: any) {
  const { value } = event.target

  if (value === '') {
    return
  }

  display.value = value

  debounceSanitizeDecimalPlace(value)
}
</script>

<template>
  <input
    class="input-base"
    type="text"
    lang="en"
    v-bind="$attrs"
    :value="display"
    @blur="onBlur"
    @focus="onFocus"
    @input="onChange"
    @paste="onPaste"
    @keydown="onKeyDown"
  />
</template>
