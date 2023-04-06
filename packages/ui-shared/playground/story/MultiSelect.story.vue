<script setup lang="ts">
const options = { MsgSend: 'Item 1', MsgDelegate: 'Item 2' }

const selectedItems = ref([])
</script>

<template>
  <Story name="multiselect component">
    <div class="flex p-4">
      <BaseMultiSelect
        v-model="selectedItems"
        v-bind="{
          options,
          inputWrapperClasses: 'py-2',
          inputClasses:
            'focus:border-blue-300 border-black/20 border p-2 rounded-md',
          contentClasses: 'p-2'
        }"
        show-search
      >
        <template #default="{ shown }">
          <button
            class="p-4 rounded-md border"
            :class="{ 'border-blue-300': shown }"
          >
            {{ shown ? 'Close' : 'Open' }}
          </button>
        </template>
        <template #item="{ display, isSelected }">
          <div class="p-2 rounded-md hover:bg-blue-300 hover:text-white w-full">
            <span>{{ display }}</span>
            <span v-if="isSelected">&check;</span>
          </div>
        </template>
      </BaseMultiSelect>
    </div>
  </Story>
</template>
