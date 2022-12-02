<script lang="ts" setup>
import { ref } from 'vue'

const activeValue = ref('one')
const list = ['one', 'two', 'three']

// function handleClick(value: string) {
//   activeValue.value = value
// }
</script>

<template>
  <Story title="Selector item component">
    <div class="flex items-center gap-4">
      <BaseSelectorItem
        v-for="item in list"
        :key="item"
        v-slot="{ active }"
        v-model="activeValue"
        :value="item"
      >
        <button
          class="flex h-10 max-h-10 items-center rounded-lg px-4 py-3 text-base font-semibold text-white outline-none hover:text-opacity-90"
          :class="[
            active
              ? 'bg-blue-600 hover:bg-blue-600/90'
              : 'bg-accent-500 hover:bg-accent-600/90'
          ]"
        >
          {{ item }}
        </button>
      </BaseSelectorItem>
    </div>
  </Story>
</template>
