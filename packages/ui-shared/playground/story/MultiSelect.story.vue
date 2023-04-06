<script setup lang="ts">
const options = [
  { key: 'MsgSend', value: 'Msg Send Value' },
  { key: 'MsgDelegate', value: 'Msg Delegate Value' }
]

const selectedItems = ref([])
const search = ref('')
</script>

<template>
  <Story name="multiselect component">
    <div class="flex p-4">
      <BaseMultiSelect
        v-model="selectedItems"
        v-bind="{
          options,
          search,
          contentClasses: 'p-2'
        }"
      >
        <template #search>
          <input
            v-model="search"
            class="border p-2 focus:border-blue-300 rounded-md"
          />
        </template>
        <template #default="{ shown }">
          <button
            class="p-4 rounded-md border"
            :class="{ 'border-blue-300': shown }"
          >
            {{ shown ? 'Close' : 'Open' }}
          </button>
        </template>
        <template #item="{ option: { value }, isSelected }">
          <div class="p-2 rounded-md hover:bg-blue-300 hover:text-white w-full">
            <span>{{ value }}</span>
            <span v-if="isSelected">&check;</span>
          </div>
        </template>
      </BaseMultiSelect>
    </div>
  </Story>
</template>
