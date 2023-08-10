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

function show() {
  isVisible.value = true
}

function hide() {
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
    @apply-hide="hide"
  >
    <div @mouseenter="show" @mouseleave="hide">
      <slot v-bind="{ isVisible, toggle: onToggle }" />
    </div>

    <template #popper>
      <div @mouseenter="show" @mouseleave="hide">
        <slot name="content" />
      </div>
    </template>
  </Menu>
</template>
