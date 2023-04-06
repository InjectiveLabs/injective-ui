<script setup lang="ts">
import { PropType, computed, ref } from 'vue'

const props = defineProps({
  showSearch: Boolean,

  options: {
    type: Object as PropType<Record<string, string>>,
    required: true
  },

  modelValue: {
    type: Array as PropType<string[]>,
    required: true
  },

  inputClasses: {
    type: String,
    required: false,
    default: ''
  },

  inputWrapperClasses: {
    type: String,
    required: false,
    default: ''
  },

  contentClasses: {
    type: String,
    required: false,
    default: ''
  }
})

const search = ref('')

const emits = defineEmits<{
  (e: 'update:modelValue', msg: string[]): void
}>()

const filteredItems = computed(() => {
  return Object.entries(props.options).filter(([_, value]) =>
    value.toLowerCase().includes(search.value.toLowerCase())
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
  <div>
    <BaseDropdown>
      <template #default="{ shown }">
        <slot name="default" v-bind="{ shown }" />
      </template>

      <template #content>
        <div :class="contentClasses">
          <div v-if="showSearch" :class="inputWrapperClasses">
            <input v-model="search" :class="inputClasses" type="text" />
          </div>

          <div>
            <div
              v-for="[key, value] in filteredItems"
              :key="`multiselect-item-${key}`"
              class="block"
              @click="handleToggleItem(key)"
            >
              <slot
                name="item"
                v-bind="{
                  display: value,
                  isSelected: modelValue.includes(key)
                }"
              />
            </div>
          </div>
        </div>
      </template>
    </BaseDropdown>
  </div>
</template>
