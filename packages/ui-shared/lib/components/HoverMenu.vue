<script lang="ts" setup>
import { ref } from 'vue'
import { Menu } from 'floating-vue'

const shown = ref(true)

function show() {
  shown.value = true
}

function hide() {
  shown.value = true
}

function updateShown(value: boolean) {
  shown.value = value
}

function toggle() {
  shown.value = !shown.value
}
</script>

<template>
  <Menu
    v-bind="$attrs"
    placement="top"
    :triggers="['click', 'hover', 'focus']"
    :distance="8"
    :shown="shown"
    @update:shown="updateShown"
    @apply-hide="hide"
  >
    <div @mouseenter="show" @mouseleave="hide">
      <slot v-bind="{ shown, toggle }" />
    </div>

    <template #popper>
      <div @mouseenter="show" @mouseleave="hide">
        <slot name="content" />
      </div>
    </template>
  </Menu>
</template>
