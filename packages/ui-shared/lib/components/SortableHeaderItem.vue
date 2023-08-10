``
<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
  isAscending: Boolean,

  value: {
    type: String,
    required: true
  },

  sortBy: {
    type: String,
    required: true
  }
})

const emit = defineEmits<{
  'update:sortBy': [value: string]
  'update:ascending': [value: boolean]
}>()

const isActive = computed(() => props.sortBy === props.value)

function onSort() {
  if (props.value !== props.sortBy) {
    emit('update:sortBy', props.value)
    emit('update:ascending', false)
  } else {
    emit('update:ascending', !props.isAscending)
  }
}
</script>

<template>
  <th @click="onSort">
    <slot :is-active="isActive" />
  </th>
</template>
