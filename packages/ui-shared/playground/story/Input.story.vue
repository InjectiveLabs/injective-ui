<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
</script>

<template>
  <Story title="Input component">
    <div class="h-screen bg-gray-900 p-4">
      <div class="w-80 rounded border border-gray-600 p-2 text-white">
        <BaseInput v-model="value" />
      </div>
    </div>
  </Story>
</template>

<style scoped>
.input {
  @apply text-white text-sm;
}
</style>
