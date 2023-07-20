<script lang="ts" setup>
import { computed } from 'vue'

const emit = defineEmits<{
  'update:modelValue': [state: string | number]
}>()

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  }
})

const active = computed(() => props.modelValue === props.value)

function click() {
  emit('update:modelValue', props.value)
}
</script>

<template>
  <div @click="click">
    <slot :active="active" />
  </div>
</template>
