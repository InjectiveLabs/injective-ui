<script lang="ts" setup>
import { ref } from 'vue'

const activeValue = ref('one')
const list = ['one', 'two', 'three']

function handleClick(value: string) {
  activeValue.value = value
}
</script>

<template>
  <Story title="Selector item component">
    <div class="flex items-center gap-4">
      <BaseSelectorItem
        v-for="item in list"
        :key="item"
        v-slot="{ active, click, value }"
        :active="activeValue === item"
        :value="item"
        @click="handleClick"
      >
        <button
          class="hover:text-opacity-90 px-4 rounded-lg flex items-center font-semibold outline-none py-3 text-base h-10 max-h-10 text-white"
          :class="[
            active
              ? 'bg-blue-600 hover:bg-blue-600/90'
              : 'bg-accent-500 hover:bg-accent-600/90'
          ]"
          @click="click"
        >
          {{ value }}
        </button>
      </BaseSelectorItem>
    </div>
  </Story>
</template>
