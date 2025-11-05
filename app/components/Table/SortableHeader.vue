<script lang="ts" setup>
import { NuxtUiIcons } from '@/types'

const props = withDefaults(
  defineProps<{
    sortKey: string
    sorting: Record<string, any>
  }>(),
  {}
)

const emit = defineEmits<{
  'header:sort': [sortKey: string]
}>()

const sortIcon = computed(() => {
  return props.sorting.key === props.sortKey
    ? props.sorting.desc
      ? NuxtUiIcons.TableSortDesc
      : NuxtUiIcons.TableSortAsc
    : NuxtUiIcons.TableSortNormal
})

function onHeaderSort() {
  console.log('onHeaderSort clicked?')

  emit('header:sort', props.sortKey)
}
</script>

<template>
  <div
    class="flex items-center capitalize gap-2 text-sm cursor-pointer text-white hover:text-white/70 transition-colors"
    @click="onHeaderSort"
  >
    <slot>
      <span> {{ props.sortKey }} </span>
    </slot>

    <UIcon :name="sortIcon" />
  </div>
</template>
