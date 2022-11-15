<script lang="ts" setup>
import { ref } from 'vue'
import { Menu } from 'floating-vue'

const shown = ref(false)

function show() {
  shown.value = true
}

function hide() {
  shown.value = false
}

function updateShown(value: boolean) {
  shown.value = value
}
</script>

<template>
  <Menu
    v-bind="$attrs"
    placement="top"
    :triggers="['hover', 'focus']"
    :distance="8"
    :shown="shown"
    @update:shown="updateShown"
    @apply-hide="hide"
  >
    <div @mouseenter="show" @mouseleave="hide">
      <slot />
    </div>

    <template #popper>
      <div @mouseenter="show" @mouseleave="hide">
        <slot name="content" />
      </div>
    </template>
  </Menu>
</template>
