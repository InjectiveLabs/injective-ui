<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
</script>

<template>
  <Story title="Numeric Input component">
    <div class="h-screen bg-gray-900 p-4">
      <div class="text-white p-2 border border-gray-600 w-80 rounded">
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
