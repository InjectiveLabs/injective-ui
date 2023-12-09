<script setup lang="ts">
import { toDataURL } from 'qrcode'
import { ref, onMounted } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  }
})

const dataUrl = ref('')

onMounted(async () => {
  const data = await toDataURL(props.text, {})
  dataUrl.value = data
})
</script>

<template>
  <img v-if="dataUrl" :src="dataUrl" />
</template>
