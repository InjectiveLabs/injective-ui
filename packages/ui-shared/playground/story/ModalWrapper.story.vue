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
        class="flex h-10 max-h-10 items-center rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white outline-none hover:bg-blue-600/90 hover:text-white/90"
        @click="showModal"
      >
        Click me!
      </button>

      <BaseModalWrapper
        :show="show"
        class="shadow-glow-lg mx-auto max-w-[90%] rounded-xl bg-gray-900 py-8 px-6 shadow-sm sm:max-w-[480px]"
        @close="closeModal"
      >
        <template #default="{ close, showLoading }">
          <div :class="{ 'min-h-[320px] flex flex-col': showLoading }">
            <div class="-mt-3">
              <BaseIcon
                name="close"
                class="hover:text-primary-500 ml-auto h-3.5 w-3.5 text-gray-600"
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
