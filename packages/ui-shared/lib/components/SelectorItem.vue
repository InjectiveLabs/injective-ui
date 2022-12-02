<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'update:modelValue', state: string): void
}>()

const props = defineProps({
  active: Boolean,
  value: {
    type: String,
    required: true
  }
})

function click() {
  emit('update:modelValue', props.value)
}
</script>

<template>
  <div>
    <slot :active="active" :click="click" :value="value" />
  </div>
</template>
