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

const isVisible = ref(false)

function onHide() {
  isVisible.value = false
}

function onMouseEnter() {
  isVisible.value = true
}

function onMouseLeave() {
  isVisible.value = false
}

function onUpdate(value: boolean) {
  isVisible.value = value
}

function onToggle() {
  isVisible.value = !isVisible.value
}
</script>

<template>
  <Menu
    v-bind="$attrs"
    placement="top"
    :triggers="triggers"
    :distance="8"
    :shown="isVisible"
    @update:shown="onUpdate"
    @apply-hide="onHide"
  >
    <div @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
      <slot v-bind="{ isVisible, toggle: onToggle }" />
    </div>

    <template #popper>
      <div @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
        <slot name="content" />
      </div>
    </template>
  </Menu>
</template>
