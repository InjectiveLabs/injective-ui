<script lang="ts" setup>
import { ref } from 'vue'
import { BaseDropdownOption } from './../../lib/types'

const selectedValue = ref('one')

const list: BaseDropdownOption[] = [
  {
    display: 'Item one',
    value: 'one'
  },
  {
    display: 'Item two',
    value: 'two'
  },
  {
    display: 'Item three',
    value: 'three'
  }
]

const selectedOption = computed(() => {
  return list.find((option) => {
    return option.value === selectedValue.value
  })
})

function handleChange(value: string) {
  selectedValue.value = value
}
</script>

<template>
  <Story title="dropdown component">
    <div class="h-screen p-4">
      <BaseDropdown class="inline-block">
        <template #default="{ shown }">
          <div
            class="flex items-center border border-gray-400 py-2 rounded gap-2"
            :class="['px-3']"
          >
            <span
              v-if="selectedOption"
              class="font-semibold text-gray-700"
              :class="['text-base leading-4']"
            >
              {{ selectedOption.display }}
            </span>
            <div>
              <BaseIcon
                name="chevron-down"
                class="w-4 h-4"
                :class="[
                  {
                    'ease-in-out duration-300 rotate-180': shown
                  }
                ]"
              />
            </div>
          </div>
        </template>

        <template #content="{ close }">
          <BaseDropdownItem
            v-for="item in list"
            :key="item.value"
            :item="item"
            @click="close"
            @change="handleChange"
          >
            <span :class="{ 'text-blue-600': item.value === selectedValue }">
              {{ item.display }}
            </span>
          </BaseDropdownItem>
        </template>
      </BaseDropdown>
    </div>
  </Story>
</template>
