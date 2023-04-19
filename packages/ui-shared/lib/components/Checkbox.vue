<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  lg: Boolean,
  sm: Boolean,
  modelValue: Boolean,
  checkboxOnRight: Boolean,

  checkColor: {
    type: String,
    default:
      'dark:border-r-white dark:border-b-white border-r-black border-b-black'
  },

  borderColor: {
    type: String,
    default: 'border-black dark:border-white'
  }
})

const emits = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const isChecked = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emits('update:modelValue', value)
})

const sizeClasses = computed(() => {
  if (props.sm) {
    return 'w-3 h-3'
  }

  if (props.lg) {
    return 'w-5 h-5'
  }

  return 'w-4 h-4'
})

const checkboxClasses = computed(() => {
  if (props.sm) {
    return '-translate-x-[2px] -translate-y-[1px]'
  }

  if (props.lg) {
    return '-translate-x-1 -translate-y-[2px]'
  }

  return '-translate-x-1 -translate-y-[2px]'
})
</script>

<template>
  <label class="relative">
    <div class="flex" :class="{ 'flex-row-reverse': checkboxOnRight }">
      <slot
        name="checkbox"
        v-bind="{ isChecked, sizeClasses, checkboxClasses }"
      >
        <div class="grid place-items-center p-2">
          <div class="relative" :class="sizeClasses">
            <div class="absolute inset-0 border" :class="borderColor">
              <div
                v-if="isChecked"
                class="absolute left-1/2 top-0 bottom-0 right-0 border-transparent border-2 rotate-45 scale-75"
                :class="[checkboxClasses, checkColor]"
              />
            </div>
          </div>
        </div>
      </slot>

      <div class="flex items-center">
        <slot />
      </div>
    </div>

    <input
      v-model="isChecked"
      type="checkbox"
      class="absolute inset-0 opacity-0"
    />
  </label>
</template>
