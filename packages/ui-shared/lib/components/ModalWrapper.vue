<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const props = defineProps({
  show: Boolean,
  showLoading: Boolean,
  wrapperClass: {
    type: String,
    default: 'bg-gray-900 bg-opacity-80'
  }
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
      class="fixed inset-0 z-50 table h-full w-full duration-300 ease-in"
      :class="wrapperClass"
    >
      <div class="table-cell align-middle">
        <div ref="modalRef" class="modal-container" :class="$attrs.class">
          <slot ref="modalRef" :close="close" :show-loading="showLoading" />
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
