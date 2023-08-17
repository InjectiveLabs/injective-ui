<script lang="ts" setup>
import { ref } from 'vue'
import { Dropdown } from 'floating-vue'

const emit = defineEmits<{
  'isVisible:change': [show: boolean]
}>()

const isVisible = ref(false)

function onUpdate(value: boolean) {
  isVisible.value = value
}

function onClose() {
  isVisible.value = false
}

defineExpose({
  isVisible
})
</script>

<template>
  <Dropdown
    v-bind="$attrs"
    class="cursor-pointer"
    :shown="isVisible"
    @update:shown="onUpdate"
    @show="emit('isVisible:change', true)"
    @hide="emit('isVisible:change', false)"
  >
    <slot :is-visible="isVisible" />

    <template #popper>
      <slot name="content" :close="onClose" />
    </template>
  </Dropdown>
</template>
