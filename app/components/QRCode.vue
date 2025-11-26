<script lang="ts" setup>
import QRCodeStyling from 'qr-code-styling'
import { injLogoBase64 } from '../data/token'

const props = withDefaults(
  defineProps<{
    text: string
    logo?: string
    imageOptions?: object
    extraConfigs?: object
    colorSettings?: object
  }>(),
  {
    logo: '',
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
    cornersDotOptions: { type: 'dot', color: '#000000' },
    cornersSquareOptions: { type: 'extra-rounded', color: '#000000' },
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
  <div class="p-2 bg-white">
    <span
      ref="qrCodeRef"
      class="shared-qr-code"
    />
  </div>
</template>

<style>
.shared-qr-code svg {
  width: 100%;
  height: 100%;
}
</style>
