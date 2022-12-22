<script lang="ts" setup>
import { PropType, ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  bgColor: {
    type: String,
    default: 'black'
  },
  bgType: {
    type: String,
    default: 'gradient'
  },
  circleRadius: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: 'black'
  },
  data: {
    type: Array as PropType<Array<number[]>>,
    required: true
  },
  sm: {
    type: Boolean,
    default: false
  },
  smoothness: {
    type: Number,
    default: 0.2
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
const observedElement = ref(undefined as HTMLElement | null | undefined)

onMounted(() => {
  ro.value = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.contentRect) {
        width.value = entry.contentRect.width
        height.value = entry.contentRect.height
      }
    }
  })

  const rootEl = root.value as HTMLElement | undefined
  if (!rootEl) {
    return
  }

  observedElement.value = rootEl.parentElement
  ro.value.observe(observedElement.value as Element)
})

onBeforeUnmount(() => {
  ro.value.unobserve(observedElement.value as Element)
})

const path = computed(() => {
  if (!width.value || !height.value) {
    return 'M 0,0'
  }

  const maxX = Math.max(...props.data.map((p: any) => p[0]))
  const minX = Math.min(...props.data.map((p: any) => p[0]))
  const maxY = Math.max(...props.data.map((p: any) => p[1]))
  const minY = Math.min(...props.data.map((p: any) => p[1]))

  const normalizedData = props.data.map((p: any) => {
    const x = normalize(p[0], minX, maxX, 0, width.value)
    const y = normalize(p[1], minY, maxY, 0, height.value)

    return [x, y]
  })

  return normalizedData.reduce(
    (acc, point, i, a) =>
      i === 0 ? `M ${point[0]},${point[1]}` : `${acc} ${curve(point, i, a)}`,
    ''
  )
})

const background = computed(() => {
  switch (props.bgType) {
    case 'gradient':
      return `url(#${id.value})`
    case 'solid':
      return props.bgColor
    case 'transparent':
      return 'transparent'
    default:
      return ''
  }
})

function normalize(
  val: number,
  valmin: number,
  valmax: number,
  min: number,
  max: number
) {
  return ((val - valmin) / (valmax - valmin)) * (max - min) + min
}

function curve(point: number[], i: number, a: number[][]) {
  const cp1 = cp(a[i - 1], a[i - 2], point)
  const cp2 = cp(point, a[i - 1], a[i + 1], true)

  return `C ${cp1[0]},${cp1[1]} ${cp2[0]},${cp2[1]} ${point[0]},${point[1]}`
}

function line(pointA: number[], pointB: number[]) {
  const lengthX = pointB[0] - pointA[0]
  const lengthY = pointB[1] - pointA[1]
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX)
  }
}

function cp(
  current: number[],
  previous: number[],
  next: number[],
  reverse?: boolean
) {
  const p = previous || current
  const n = next || current
  const o = line(p, n)
  const angle = o.angle + (reverse ? Math.PI : 0)
  const length = o.length * props.smoothness
  const x = current[0] + Math.cos(angle) * length
  const y = current[1] + Math.sin(angle) * length
  return [x, y]
}
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
    <defs>
      <linearGradient :id="id.toString()" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" :style="`stop-color: ${bgColor}; stop-opacity: 1`" />
        <stop
          offset="100%"
          :style="`stop-color: ${bgColor}; stop-opacity: 0`"
        />
      </linearGradient>
    </defs>
    <path
      :d="`${path} L ${width} ${height},L 0 ${height}Z`"
      :fill="background"
    />
    <path :d="path" :stroke="color" :stroke-width="strokeWidth" fill="none" />
    <g>
      <circle
        v-for="(p, i) in data"
        :key="i"
        :cx="p[0]"
        :cy="p[1]"
        :r="circleRadius"
        :fill="color"
      />
    </g>
  </svg>
</template>
