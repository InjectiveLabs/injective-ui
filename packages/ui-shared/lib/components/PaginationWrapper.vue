<script lang="ts" setup>
import { computed, PropType } from 'vue'

const props = defineProps({
  disabled: Boolean,
  extraLimitOptions: {
    type: Array as PropType<number[]>,
    default: () => []
  },

  limit: {
    type: Number,
    required: true
  },

  page: {
    type: Number,
    required: true
  },

  totalCount: {
    type: Number,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:page', page: number): void
  (e: 'update:limit', limit: number): void
}>()

const limitOptions = [10, 20, 30, 40, 50]

const rowOptions = computed(() =>
  [...limitOptions, ...props.extraLimitOptions].sort((a, b) => a - b)
)

const totalPages = computed(() => Math.ceil(props.totalCount / props.limit))
const hasPrevPage = computed(() => props.page > 1)
const hasNextPage = computed(() => props.page !== totalPages.value)
const from = computed(() => {
  return props.page * props.limit - props.limit + 1
})
const to = computed(() => {
  const maxCountOnPage = props.limit * props.page

  return maxCountOnPage > props.totalCount ? props.totalCount : maxCountOnPage
})
const pagesToDisplay = computed(() => {
  const middlePagesToDisplay = [] as Array<string | number>

  if (totalPages.value <= 7) {
    return [...Array(totalPages.value + 1).keys()].splice(1)
  }

  if (props.page < 4) {
    middlePagesToDisplay.push(2, 3, 4, 5, '...')
  } else if (totalPages.value - 3 <= props.page) {
    middlePagesToDisplay.push(
      '...',
      totalPages.value - 4,
      totalPages.value - 3,
      totalPages.value - 2,
      totalPages.value - 1
    )
  } else {
    middlePagesToDisplay.push(
      '...',
      props.page - 1,
      props.page,
      props.page + 1,
      '...'
    )
  }

  return [1, ...middlePagesToDisplay, totalPages.value]
})

function handleClickEvent(page: number | string) {
  if (!props.disabled && typeof page !== 'number') {
    emit('update:page', Number(page))
  }
}

function handleNextEvent() {
  if (!props.disabled && hasNextPage.value) {
    emit('update:page', props.page + 1)
  }
}

function handlePrevEvent() {
  if (!props.disabled && hasPrevPage.value) {
    emit('update:page', props.page - 1)
  }
}

function handleUpdateLimit(limit: number) {
  emit('update:page', 1)
  emit('update:limit', limit)
}
</script>

<template>
  <div>
    <slot name="summary" :from="from" :to="to">
      <div />
    </slot>
    <slot
      :has-prev-page="hasPrevPage"
      :has-next-page="hasNextPage"
      :handle-click-event="handleClickEvent"
      :handle-next-event="handleNextEvent"
      :handle-prev-event="handlePrevEvent"
      :pages-to-display="pagesToDisplay"
      :total-pages="totalPages"
    />

    <slot
      name="row-select"
      :row-options="rowOptions"
      :handle-update-limit="handleUpdateLimit"
    >
      <div />
    </slot>
  </div>
</template>
