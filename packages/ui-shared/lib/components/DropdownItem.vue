<script lang="ts" setup>
import { PropType } from 'vue'
import { BaseDropdownOption } from './../../lib/types'

const props = defineProps({
  item: {
    type: Object as PropType<BaseDropdownOption>,
    required: true
  }
})

const emit = defineEmits<{
  change: [state: string]
}>()

function handleClick() {
  emit('change', props.item.value)
}
</script>

<template>
  <div class="flex cursor-pointer items-center" @click="handleClick">
    <slot :item="item" />
  </div>
</template>
