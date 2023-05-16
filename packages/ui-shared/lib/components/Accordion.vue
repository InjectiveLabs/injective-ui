<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },

  value: {
    type: [String, Number],
    default: ''
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const active = computed(() => props.modelValue === props.value)

function handleToggle() {
  emit('update:modelValue', props.value)
}
</script>

<template>
  <div>
    <div class="accordion-header" @click="handleToggle">
      <slot name="header" v-bind="{ active }" />
    </div>
    <div
      class="accordion-content"
      :class="[active ? 'accordion-open' : 'accordion-closed']"
    >
      <div>
        <slot name="content" v-bind="{ active }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.accordion-header {
  user-select: none;
}

.accordion-content {
  display: grid;
  transition: all 0.3s;
}
.accordion-content > div {
  overflow: hidden;
}
.accordion-open {
  grid-template-rows: 1fr;
}
.accordion-closed {
  grid-template-rows: 0fr;
}
</style>
