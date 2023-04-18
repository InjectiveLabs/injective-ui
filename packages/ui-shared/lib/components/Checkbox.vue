<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  checkboxOnRight: Boolean,
  sm: Boolean,
  lg: Boolean
})

const emits = defineEmits<{
  (e: 'update:modelValue', value: Boolean)
}>()

const isChecked = computed({
  get: () => props.modelValue,
  set: (value) => emits('update:modelValue', value)
})

const classesComputed = computed(() => {
  if (props.sm) return 'w-3 h-3'

  if (props.lg) return 'w-5 h-5'

  return 'w-4 h-4'
})

const checkboxClassesComputed = computed(() => {
  if (props.sm) return '-translate-x-[2px] -translate-y-[1px] scale-75'

  if (props.lg) return '-translate-x-1 -translate-y-[2px] scale-75'

  return '-translate-x-1 -translate-y-[2px] scale-75'
})
</script>

<template>
  <label class="relative">
    <div class="flex" :class="[checkboxOnRight && 'flex-row-reverse']">
      <slot name="checkbox" v-bind="{ isChecked }">
        <div class="grid place-items-center p-2">
          <div class="relative" :class="classesComputed">
            <div class="absolute inset-0 border-black dark:border-white border">
              <div
                v-if="isChecked"
                class="absolute left-1/2 top-0 bottom-0 right-0 border-transparent dark:border-r-white dark:border-b-white border-r-black border-b-black border-2 rotate-45"
                :class="checkboxClassesComputed"
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
