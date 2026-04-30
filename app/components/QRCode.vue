<script lang="ts" setup>
import QRCodeStyling from 'qr-code-styling'
import { injLogoBase64 } from '../data/token'

const props = withDefaults(
  defineProps<{
    text: string
    logo?: string
    bgColor?: string
    cornerColor?: string
    imageOptions?: object
    extraConfigs?: object
    colorSettings?: object
  }>(),
  {
    logo: '',
    bgColor: '#FFFFFF',
    cornerColor: '#000000',
    imageOptions: undefined,
    colorSettings: undefined,
    extraConfigs: () => ({})
  }
)

const qrCodeRef = ref()

onMounted(() => {
  const qrCode = new QRCodeStyling({
    type: 'svg',
    data: props.text,
    image: props.logo || injLogoBase64,
    qrOptions: { errorCorrectionLevel: 'H' },
    backgroundOptions: { color: props.bgColor },
    cornersDotOptions: { type: 'dot', color: props.cornerColor },
    cornersSquareOptions: { type: 'extra-rounded', color: props.cornerColor },
    imageOptions: props.imageOptions || { margin: 16, imageSize: 0.4 },
    dotsOptions: {
      type: 'dots',
      ...(props.colorSettings || {
            gradient: {
              type: 'radial',
              rotation: 0,
              colorStops: [
                { offset: 0.5, color: '#7C70FF' },
                { offset: 1, color: '#5208c7' }
              ]
            }
          })

    },
    ...props.extraConfigs
  })

  qrCode.append(qrCodeRef.value)
})
</script>

<template>
  <div class="p-2 relative" :style="{ backgroundColor: bgColor }">
    <span
      ref="qrCodeRef"
      class="shared-qr-code"
    />
    <slot name="overlay" />
  </div>
</template>

<style>
.shared-qr-code svg {
  width: 100%;
  height: 100%;
}
</style>
