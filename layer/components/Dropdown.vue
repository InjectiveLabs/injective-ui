<script lang="ts" setup>
import { ref } from 'vue'
import { Dropdown } from 'floating-vue'

const emit = defineEmits<{
  'isOpen:change': [show: boolean]
  'update:isOpen': [show: boolean]
}>()

const isOpen = ref(false)

function onUpdate(value: boolean) {
  isOpen.value = value
}

function onClose() {
  isOpen.value = false
}

function onOpenDropdown() {
  emit('isOpen:change', true)
  emit('update:isOpen', true)
}

function onCloseDropdown() {
  emit('isOpen:change', false)
  emit('update:isOpen', false)
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
    @show="onOpenDropdown"
    @hide="onCloseDropdown"
  >
    <slot :is-open="isOpen" />

    <template #popper>
      <slot name="content" :close="onClose" />
    </template>
  </Dropdown>
</template>
