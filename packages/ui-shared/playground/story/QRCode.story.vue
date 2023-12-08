<script setup lang="ts">
const text = ref('Shabanee')
</script>

<template>
  <Story name="qr-code">
    <div class="p-4 dark:text-white space-y-2">
      <div>
        <label for="text-input">Change Text</label>
      </div>
      <div>
        <input
          id="text-input"
          v-model="text"
          class="p-2 rounded border text-black"
        />
      </div>

      <BaseQRCode :key="text" :text="text" />
    </div>
  </Story>
</template>
