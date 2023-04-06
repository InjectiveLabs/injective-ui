<script setup lang="ts">
import { PropType, computed } from 'vue'

type SelectOption = {
  key: string
  value: string
}

const props = defineProps({
  options: {
    type: Array as PropType<SelectOption[]>,
    required: true
  },

  search: {
    type: String,
    required: false,
    default: ''
  },

  modelValue: {
    type: Array as PropType<string[]>,
    required: true
  },

  contentClasses: {
    type: String,
    required: false,
    default: ''
  }
})

const emits = defineEmits<{
  (e: 'update:modelValue', msg: string[]): void
}>()

const filteredItems = computed(() => {
  return props.options.filter(({ value }) =>
    value.toLowerCase().includes(props.search.toLowerCase())
  )
})

function handleToggleItem(key: string) {
  if (props.modelValue.includes(key)) {
    emits(
      'update:modelValue',
      props.modelValue.filter((message) => message !== key)
    )
  } else {
    emits('update:modelValue', [...props.modelValue!, key])
  }
}
</script>

<template>
  <BaseDropdown>
    <template #default="{ shown }">
      <slot name="default" v-bind="{ shown }" />
    </template>

    <template #content>
      <div :class="contentClasses">
        <slot name="search" />

        <div>
          <div
            v-for="option in filteredItems"
            :key="`multiselect-item-${option.key}`"
            class="block"
            @click="handleToggleItem(option.key)"
          >
            <slot
              name="item"
              v-bind="{
                option: option,
                isSelected: modelValue.includes(option.key)
              }"
            />
          </div>
        </div>
      </div>
    </template>
  </BaseDropdown>
</template>
