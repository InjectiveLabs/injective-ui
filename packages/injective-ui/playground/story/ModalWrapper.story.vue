<script lang="ts" setup>
import { ref } from 'vue'

const show = ref(false)

function showModal() {
  show.value = true
}

function closeModal() {
  show.value = false
}
</script>

<template>
  <Story title="Modal wrapper component">
    <div class="h-screen">
      <button
        class="hover:text-opacity/90 hover:bg-opacity/90 px-4 rounded-lg flex items-center font-semibold outline-none py-3 text-base h-10 max-h-10 bg-blue-600 text-white"
        @click="showModal"
      >
        Click me!
      </button>

      <BaseModalWrapper :show="show" @close="closeModal">
        <template #default="{ close, showLoading }">
          <div
            class="modal-container shadow-glow-lg modal-container mx-auto py-8 px-6 max-w-[90%] sm:max-w-[480px] bg-gray-900 rounded-xl shadow-sm transition-all ease-in duration-300 relative"
            :class="{ 'min-h-[320px] flex flex-col': showLoading }"
            @trigger="close"
          >
            <div class="-mt-3">
              <BaseIcon
                name="close"
                class="hover:text-primary-500 h-3.5 w-3.5 ml-auto text-gray-600"
                @click="close"
              />
            </div>

            <slot />
          </div>
        </template>
      </BaseModalWrapper>
    </div>
  </Story>
</template>
