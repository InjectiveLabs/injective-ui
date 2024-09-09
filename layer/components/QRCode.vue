<script lang="ts" setup>
import QRCodeVue3 from 'qr-code-generator-vue3'
import { injLogoBase64 } from './../data/token'

withDefaults(
  defineProps<{
    text: string
  }>(),
  {}
)

const option = {
  value: '',
  width: 300,
  height: 300,
  margin: 0,
  imgclass: '',
  myclass: '',
  downloadButton: '',
  ButtonName: 'Download',
  qrOptions: {
    typeNumber: 0,
    mode: 'Byte',
    errorCorrectionLevel: 'Q'
  },
  imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 0 },
  dotsOptions: {
    type: 'dots',
    color: '#6a1a4c',
    gradient: {
      type: 'linear',
      rotation: 0,
      colorStops: [
        { offset: 0, color: '#6a1a4c' },
        { offset: 1, color: '#6a1a4c' }
      ]
    }
  },
  backgroundOptions: { color: '#ffffff' },
  cornersSquareOptions: { type: 'dot', color: '#000000' },
  cornersDotOptions: { type: undefined, color: '#000000' },
  fileExt: 'png',
  image: '',
  download: false,
  downloadOptions: { name: 'vqr', extension: 'png' }
}
</script>

<template>
  <div class="p-2 bg-white">
    <QRCodeVue3
      v-bind="{
        ...option,
        value: text,
        image: injLogoBase64,
        margin: 0,
        dotsOptions: {
          type: 'dots',
          gradient: {
            type: 'radial',
            rotation: 0,
            colorStops: [
              { offset: 0.5, color: '#007CF6' },
              { offset: 1, color: '#5208c7' }
            ]
          }
        },
        imageOptions: { imageSize: 0.4, margin: 16 },
        cornersDotOptions: {
          type: 'dot',
          color: '#000000'
        },
        cornersSquareOptions: {
          type: 'extra-rounded',
          color: '#000'
        }
      }"
    />
  </div>
</template>
