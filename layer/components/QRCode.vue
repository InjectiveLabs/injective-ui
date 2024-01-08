<script setup lang="ts">
import { useQRCode } from '@vueuse/integrations/useQRCode'

const props = defineProps({
  text: {
    type: String,
    required: true
  }
})

const qrcode = useQRCode(props.text)
</script>

<template>
  <img :src="qrcode" alt="QR Code" />
</template>
