<script lang="ts" setup>
import { ref } from 'vue'
import { Dropdown } from 'floating-vue'

const emit = defineEmits<{
  'isOpen:change': [show: boolean]
}>()

const isOpen = ref(false)

function onUpdate(value: boolean) {
  isOpen.value = value
}

function onClose() {
  isOpen.value = false
}

defineExpose({
  isOpen
})
</script>

<template>
  <Dropdown
    v-bind="$attrs"
    class="cursor-pointer"
    :shown="isOpen"
    @update:shown="onUpdate"
    @show="emit('isOpen:change', true)"
    @hide="emit('isOpen:change', false)"
  >
    <slot :is-open="isOpen" />

    <template #popper>
      <slot name="content" :close="onClose" />
    </template>
  </Dropdown>
</template>
