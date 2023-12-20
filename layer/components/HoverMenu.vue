<script lang="ts" setup>
import { ref } from 'vue'
import { Menu } from 'floating-vue'

defineProps({
  triggers: {
    type: Array,
    default: () => ['click', 'hover', 'focus'],
    required: false
  }
})

const isOpen = ref(true)

function onHide() {
  isOpen.value = false
}

function onMouseEnter() {
  isOpen.value = true
}

function onMouseLeave() {
  isOpen.value = false
}

function onUpdate(value: boolean) {
  isOpen.value = value
}

function onToggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <Menu
    v-bind="$attrs"
    placement="top"
    :triggers="triggers"
    :distance="8"
    :shown="isOpen"
    @update:shown="onUpdate"
    @apply-hide="onHide"
  >
    <div @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
      <slot v-bind="{ isOpen, toggle: onToggle }" />
    </div>

    <template #popper>
      <div @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
        <slot name="content" />
      </div>
    </template>
  </Menu>
</template>
