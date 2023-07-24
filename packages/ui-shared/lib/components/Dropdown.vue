<script lang="ts" setup>
import { ref } from 'vue'
import { Dropdown } from 'floating-vue'

const emit = defineEmits<{
  'update:show': [show: boolean]
}>()

const shown = ref(false)

function updateShown(value: boolean) {
  shown.value = value
}

function close() {
  shown.value = false
}

defineExpose({
  shown
})
</script>

<template>
  <Dropdown
    v-bind="$attrs"
    class="cursor-pointer"
    :shown="shown"
    @update:shown="updateShown"
    @show="emit('update:show', true)"
    @hide="emit('update:show', false)"
  >
    <slot :shown="shown" />

    <template #popper>
      <slot name="content" :close="close" />
    </template>
  </Dropdown>
</template>
