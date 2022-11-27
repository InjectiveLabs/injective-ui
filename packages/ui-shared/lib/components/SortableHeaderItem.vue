<script lang="ts" setup>
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
  (e: 'update:sortBy', value: string): null
  (e: 'update:ascending', value: boolean): null
}>()

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
  <div class="flex cursor-pointer items-center gap-2" @click="handleSort">
    <slot></slot>
    <div
      class="transition-all"
      :class="[
        value === sortBy
          ? 'text-[var(--sortable-item-active-color)]'
          : 'text-[var(--sortable-item-inactive-color)]',
        {
          'rotate-180': ascending && value === sortBy
        }
      ]"
    >
      <BaseIcon name="triangle" xs />
    </div>
  </div>
</template>
