<script lang="ts" setup>
import { useDebounceFn } from '@vueuse/core'
import {
  convertToNumericValue,
  passNumericInputValidation
} from './../utils/input'
import { DOMEvent, KeydownEvent, PasteEvent } from './../types'

const props = defineProps({
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
  (e: 'update:modelValue', state: string): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'keydown', event: KeydownEvent<HTMLInputElement>): void
}>()

const delayUpdateInput = useDebounceFn((value: string | number) => {
  emit('update:modelValue', value.toString())
}, 500)

function onFocus() {
  emit('focus')
}

function onBlur(event: DOMEvent<HTMLInputElement>) {
  const value = parseFloat(event.target.value)

  delayUpdateInput(value)
  emit('blur')
}

function onKeyDown(payload: KeyboardEvent) {
  const event = payload as KeydownEvent<HTMLInputElement>

  // prevent user from passing +, -, e, or additionalInvalidKeys to the input field since the hub does not support signs or scientific notation
  if (
    !passNumericInputValidation(event, props.maxDecimals === 0 ? ['.'] : [])
  ) {
    event.preventDefault()
  } else {
    emit('keydown', event)
  }
}

function onPaste(payload: ClipboardEvent) {
  const event = payload as PasteEvent<HTMLInputElement>
  const { clipboardData } = event

  event.preventDefault()

  if (clipboardData) {
    const value = clipboardData.getData('text')
    const formattedValue = convertToNumericValue(value, props.maxDecimals)

    emit('update:modelValue', `${formattedValue}`)
  }
}

function onChange(event: any) {
  const { value } = event.target

  //  prevent user from entering an endless amount of digits after the decimal by limiting to no more than 2 X maxDecimal places as they're typing
  const numericValueWithExtraDecimals = convertToNumericValue(
    value,
    Math.min(props.maxDecimals * 2, 18)
  )

  if (isNaN(Number(numericValueWithExtraDecimals))) {
    // reset input value if user deletes all input
    delayUpdateInput('')
  }

  const formattedValueWithExtraDecimals =
    numericValueWithExtraDecimals.toString()

  emit('update:modelValue', formattedValueWithExtraDecimals)

  // update input value to allow only the max decimals for final value
  const numberValue = convertToNumericValue(value, props.maxDecimals)

  if (isNaN(Number(numberValue))) {
    delayUpdateInput('')
  }

  const formattedValue = numberValue.toString()

  delayUpdateInput(formattedValue)
}
</script>

<template>
  <input
    class="input"
    type="number"
    v-bind="$attrs"
    :value="modelValue"
    @blur="onBlur"
    @focus="onFocus"
    @input="onChange"
    @paste="onPaste"
    @keydown="onKeyDown"
  />
</template>
