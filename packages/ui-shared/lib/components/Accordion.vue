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
  <div class="accordion">
    <div class="header" @click="handleToggle">
      <slot name="header" v-bind="{ active }" />
    </div>
    <div class="content" :class="[active ? 'open' : 'closed']">
      <div>
        <slot name="content" v-bind="{ active }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.accordion {
  .header {
    user-select: none;
  }

  .content {
    display: grid;
    transition: all 0.3s;
  }
  .content > div {
    overflow: hidden;
  }
  .open {
    grid-template-rows: 1fr;
  }
  .closed {
    grid-template-rows: 0fr;
  }
}
</style>
