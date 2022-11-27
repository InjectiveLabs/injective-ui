<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
</script>

<template>
  <Story title="Numeric Input component">
    <div class="h-screen bg-gray-900 p-4">
      <div class="w-80 rounded border border-gray-600 p-2 text-white">
        <BaseNumericInput v-model="value" :max-decimals="2" />
      </div>
    </div>
  </Story>
</template>

<style scoped>
.input {
  @apply text-white text-sm;
}
</style>
