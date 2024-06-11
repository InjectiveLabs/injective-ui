<script lang="ts" setup>
import JSConfetti from 'js-confetti'

const canvas = ref(null)
const confetti = ref(null)

onMounted(() => {
  confetti.value = new JSConfetti({
    canvas: canvas.value
  })

  confetti.value.addConfetti()
})
</script>

<template>
  <canvas
    ref="canvas"
    class="inset-0 fixed pointer-events-none w-screen h-screen z-50"
  />
</template>
