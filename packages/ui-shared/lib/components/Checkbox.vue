<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  disabled: Boolean,
  modelValue: Boolean,
  checkboxOnRight: Boolean
})

const emits = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const isChecked = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    if (!props.disabled) {
      emits('update:modelValue', value)
    }
  }
})
</script>

<template>
  <label class="relative">
    <div
      class="flex gap-2"
      :class="[
        { 'flex-row-reverse': checkboxOnRight },
        disabled ? 'cursor-not-allowed' : 'cursor-pointer'
      ]"
    >
      <slot name="checkbox" v-bind="{ isChecked, disabled }" />

      <div class="flex items-center">
        <slot />
      </div>
    </div>

    <input v-model="isChecked" type="checkbox" class="hidden" />
  </label>
</template>
