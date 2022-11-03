<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const props = defineProps({
  show: Boolean,
  showLoading: Boolean
})

const modalRef = ref(null)

onKeyStroke('Escape', () => {
  if (props.show) {
    close()
  }
})

onClickOutside(modalRef, () => {
  close()
})

const close = () => {
  emit('close')
}
</script>
<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<template>
  <Transition name="modal" appear>
    <div
      v-if="show"
      class="bg-opacity/30 z-50 fixed inset-0 w-full h-full bg-gray-900 table ease-in duration-300"
      :class="$attrs.class"
    >
      <div class="table-cell align-middle">
        <div ref="modalRef" class="modal-container">
          <slot :close="close" :show-loading="showLoading" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-from,
.modal-leave-to {
  @apply opacity-0;
}

.modal-leave-active .modal-container {
  transition: 300ms cubic-bezier(0.4, 0, 1, 1);
  transform: scale(0.9);
}
</style>
