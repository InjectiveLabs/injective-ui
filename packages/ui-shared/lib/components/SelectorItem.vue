<script lang="ts" setup>
import { computed } from 'vue'

const emit = defineEmits<{
  (e: 'update:modelValue', state: string): void
}>()

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  value: {
    type: String,
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
