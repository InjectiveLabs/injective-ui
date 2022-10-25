<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'click', state: string): void
}>()

const props = defineProps({
  active: Boolean,
  value: {
    type: String,
    required: true
  }
})

function click() {
  emit('click', props.value)
}
</script>

<template>
  <div>
    <slot :active="active" :click="click" :value="value" />
  </div>
</template>
