<script setup lang="ts">
import { useIMask } from 'vue-imask'
import type { FactoryOpts } from 'imask'

const props = defineProps({
  isAutofix: Boolean,
  isShowMask: Boolean,

  modelValue: {
    type: String,
    default: ''
  },

  maxDecimals: {
    type: Number,
    default: 6
  },

  max: {
    type: Number,
    default: 10 ** 18
  },

  min: {
    type: Number,
    default: undefined
  }
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const hardCodedIMaskOptions = {
  mask: 'num',
  lazy: false,
  blocks: {
    num: {
      mask: Number,
      radix: '.',
      mapToRadix: ['.', ',']
    }
  }
}

const { typed, el } = useIMask(
  computed(
    () =>
      ({
        ...hardCodedIMaskOptions,
        blocks: {
          num: {
            ...hardCodedIMaskOptions.blocks.num,
            min: props.min,
            max: props.max,
            scale: props.maxDecimals,
            isAutofix: props.isAutofix,
            thousandsSeparator: props.isShowMask ? ',' : ''
          }
        }
      }) as FactoryOpts
  ),
  {
    onAccept: (e) => {
      emit('update:modelValue', typed.value)
    }
  }
)

watch(
  () => props.modelValue,
  (value: string) => {
    typed.value = value
  }
)
</script>

<template>
  <input ref="el" type="text" v-bind="$attrs" />
</template>
