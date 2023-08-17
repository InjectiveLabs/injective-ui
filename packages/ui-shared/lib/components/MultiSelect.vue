<script setup lang="ts">
import { PropType, computed } from 'vue'
import { BaseDropdownOption } from '../types'

const props = defineProps({
  search: {
    type: String,
    default: ''
  },

  contentClasses: {
    type: String,
    default: ''
  },

  modelValue: {
    type: Array as PropType<string[]>,
    required: true
  },

  options: {
    type: Array as PropType<BaseDropdownOption[]>,
    required: true
  }
})

const emits = defineEmits<{
  'update:modelValue': [msg: string[]]
}>()

const filteredItems = computed(() => {
  return props.options.filter(({ display }) =>
    display.toLowerCase().includes(props.search.toLowerCase())
  )
})

function onToggle(value: string) {
  if (props.modelValue.includes(value)) {
    emits(
      'update:modelValue',
      props.modelValue.filter((message) => message !== value)
    )
  } else {
    emits('update:modelValue', [...props.modelValue!, value])
  }
}
</script>

<template>
  <BaseDropdown>
    <template #default="{ isOpen }">
      <slot name="default" v-bind="{ isOpen }" />
    </template>

    <template #content>
      <div :class="contentClasses">
        <slot name="search" />

        <div
          v-for="option in filteredItems"
          :key="`multiselect-item-${option.value}`"
          @click="onToggle(option.value)"
        >
          <slot
            name="item"
            v-bind="{
              option: option,
              isSelected: modelValue.includes(option.value)
            }"
          />
        </div>
      </div>
    </template>
  </BaseDropdown>
</template>
