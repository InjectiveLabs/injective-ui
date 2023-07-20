``
<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: String,
    required: true
  },

  sortBy: {
    type: String,
    required: true
  },

  ascending: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits<{
  'update:sortBy': [value: string]
  'update:ascending': [value: boolean]
}>()

const active = computed(() => props.sortBy === props.value)

function handleSort() {
  if (props.value !== props.sortBy) {
    emit('update:sortBy', props.value)
    emit('update:ascending', false)
  } else {
    emit('update:ascending', !props.ascending)
  }
}
</script>

<template>
  <th @click="handleSort">
    <slot :active="active" />
  </th>
</template>
