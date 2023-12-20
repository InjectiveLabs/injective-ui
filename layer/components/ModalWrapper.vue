<script setup lang="ts">
import { ref, PropType } from 'vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'

const emit = defineEmits<{
  'modal:closed': []
}>()

const props = defineProps({
  isOpen: Boolean,
  isLoading: Boolean,

  ignore: {
    type: Array as PropType<string[]>,
    default: () => []
  },

  containerClass: {
    type: String,
    default: ''
  },

  wrapperClass: {
    type: String,
    default: 'bg-gray-900 bg-opacity-80'
  }
})

const modalRef = ref(null)

function closeModal() {
  if (props.isOpen) {
    emit('modal:closed')
  }
}

function onModalClose() {
  closeModal()
}

onKeyStroke('Escape', () => {
  closeModal()
})

onClickOutside(
  modalRef,
  () => {
    closeModal()
  },
  {
    ignore: ['.modal-content', ...props.ignore]
  }
)
</script>
<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<template>
  <Transition name="modal" appear>
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 h-full w-full duration-300 ease-in"
      :class="wrapperClass"
    >
      <div class="flex items-center justify-center h-full">
        <div
          ref="modalRef"
          class="modal-container overflow-y-hidden"
          :class="$attrs.class"
        >
          <div
            class="max-h-screen sm:max-h-[90vh] overflow-y-auto"
            :class="containerClass"
          >
            <div class="modal-content">
              <slot :close="onModalClose" v-bind="{ isLoading }" />
            </div>
          </div>
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
