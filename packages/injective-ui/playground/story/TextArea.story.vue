<script lang="ts" setup>
import { ref } from 'vue'

const value = ref('')
</script>

<template>
  <Story title="Textarea component">
    <div class="h-screen bg-gray-900 p-4">
      <div class="rounded border border-gray-600 text-white">
        <BaseTextArea v-model="value" :row="4" class="px-2 pt-1" />
      </div>
    </div>
  </Story>
</template>

<style scoped>
.input {
  @apply text-white text-sm;
}
</style>
