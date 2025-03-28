<script lang="ts" setup>
import { useDebounceFn } from '@vueuse/core'
import { ref } from 'vue'
import { Menu } from 'floating-vue'

defineProps({
  triggers: {
    type: Array as any,
    default: () => ['click', 'hover', 'focus'] as any,
    required: false
  },

  container: {
    type: String,
    default: 'body',
    required: false
  },

  placement: {
    type: String,
    default: 'top',
    required: false
  },

  boundary: {
    type: String,
    default: undefined,
    required: false
  },

  distance: {
    type: Number,
    default: 8,
    required: false
  }
})

const emit = defineEmits<{
  'on:hide': []
}>()

const isOpen = ref(false)

function onHide() {
  isOpen.value = false

  emit('on:hide')
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

const closeDebounce = useDebounceFn(() => {
  isOpen.value = false
}, 50)
</script>

<template>
  <Menu
    v-bind="$attrs"
    :placement="placement as any"
    :container="container"
    :popper-triggers="triggers"
    :triggers="triggers"
    :boundary="boundary"
    :distance="distance"
    :shown="isOpen"
    @update:shown="onUpdate"
    @apply-hide="onHide"
  >
    <div @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
      <slot v-bind="{ isOpen, toggle: onToggle }" />
    </div>

    <template #popper>
      <div @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
        <slot name="content" v-bind="{ close: closeDebounce }" />
      </div>
    </template>
  </Menu>
</template>
