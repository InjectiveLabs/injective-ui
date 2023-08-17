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
  'item:selected': [state: string]
}>()

function onClick() {
  emit('item:selected', props.item.value)
}
</script>

<template>
  <div class="flex cursor-pointer items-center" @click="onClick">
    <slot :item="item" />
  </div>
</template>
