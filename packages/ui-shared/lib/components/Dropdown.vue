<script lang="ts" setup>
import { ref } from 'vue'
import { Dropdown } from 'floating-vue'

const emit = defineEmits<{
  (e: 'update:show', show: boolean): void
}>()

const shown = ref(false)

function updateShown(value: boolean) {
  shown.value = value

  emit('update:show', value)
}

function close() {
  shown.value = false
}
</script>

<template>
  <Dropdown
    v-bind="$attrs"
    class="cursor-pointer"
    :shown="shown"
    @update:shown="updateShown"
  >
    <slot :shown="shown" />

    <template #popper>
      <slot name="content" :close="close" />
    </template>
  </Dropdown>
</template>
