<script lang="ts" setup>
import type { PropType } from 'vue'

type GraphPoint = [number, number, ...number[]]

const isFiniteGraphPoint = (point: number[]): point is GraphPoint =>
  point.length >= 2 && point.slice(0, 2).every(Number.isFinite)

const props = defineProps({
  color: {
    type: String,
    default: 'black'
  },

  data: {
    type: Array as PropType<Array<number[]>>,
    required: true
  },

  strokeWidth: {
    type: Number,
    default: 2
  }
})

const id = ref(Math.random() + Date.now())
const root = ref(undefined)
const width = ref(0)
const height = ref(0)
const ro = ref(undefined as unknown as ResizeObserver)
const observedElement = ref(undefined as null | undefined | HTMLElement)

onMounted(() => {
  ro.value = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.contentRect) {
        width.value = entry.contentRect.width
        height.value = entry.contentRect.height
      }
    }
  })

  const rootEl = root.value as undefined | HTMLElement

  if (!rootEl) {
    return
  }

  observedElement.value = rootEl.parentElement as any
  ro.value.observe(observedElement.value as HTMLElement)
})

onBeforeUnmount(() => {
  ro.value.unobserve(observedElement.value as HTMLElement)
})

const polyfillPoints = computed(() => {
  const validPoints = props.data.filter(isFiniteGraphPoint)

  const maxX = Math.max(...validPoints.map((p) => p[0]))
  const maxY = Math.max(...validPoints.map((p) => p[1]))
  const minY = Math.min(...validPoints.map((p) => p[1]))

  const percentageDifferenceY = 100 - (minY / maxY) * 100

  return validPoints.reduce((points, point) => {
    const [x, y] = point

    const pointXInWidth = (x / maxX) * width.value
    const yHeight =
      percentageDifferenceY === 0 ? 0.5 : (y - minY) / (maxY - minY)

    const pointYInHeight = height.value - yHeight * height.value

    return `${points} ${pointXInWidth},${pointYInHeight}`
  }, '')
})
</script>

<template>
  <svg
    id="chart"
    ref="root"
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polyline
      :id="`${id}`"
      :points="polyfillPoints"
      style="fill: none; stroke-width: 1"
      :style="{ stroke: color, 'stroke-width': strokeWidth }"
    />
  </svg>
</template>
