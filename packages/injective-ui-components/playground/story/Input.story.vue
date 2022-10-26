<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
</script>

<template>
  <Story title="Input component">
    <div class="h-screen bg-gray-900 p-4">
      <div class="text-white p-2 border border-gray-600 w-80 rounded">
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
