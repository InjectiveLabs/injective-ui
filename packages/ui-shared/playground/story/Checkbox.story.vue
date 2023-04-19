<script setup lang="ts">
const checked = ref(false)
</script>

<template>
  <Story title="checkbox">
    <div class="p-2 max-w-lg space-y-4 text-white">
      <div class="border-b border-white py-2">
        <BaseCheckbox v-model="checked" lg>
          <template #checkbox="{ isChecked }">
            <div class="grid place-items-center">
              <div class="relative w-4 h-4">
                <div class="absolute inset-0 border border-white">
                  <div
                    v-if="isChecked"
                    class="absolute left-1/2 top-0 bottom-0 right-0 border-transparent border-2 rotate-45 scale-75 border-r-white border-b-white -translate-x-1 -translate-y-[2px]"
                  />
                </div>
              </div>
            </div>
          </template>
          <span>Checkbox</span>
        </BaseCheckbox>
      </div>

      <div class="border-b border-white py-2">
        <BaseCheckbox v-model="checked" lg disabled>
          <template #checkbox="{ isChecked }">
            <div class="grid place-items-center">
              <div class="relative w-4 h-4">
                <div class="absolute inset-0 border border-white">
                  <div
                    v-if="isChecked"
                    class="absolute left-1/2 top-0 bottom-0 right-0 border-transparent border-2 rotate-45 scale-75 border-r-white border-b-white -translate-x-1 -translate-y-[2px]"
                  />
                </div>
              </div>
            </div>
          </template>
          Disabled
        </BaseCheckbox>
      </div>

      <div class="border-b border-white py-2 flex justify-end">
        <BaseCheckbox v-model="checked" checkbox-on-right>
          <template #checkbox="{ isChecked }">
            <div class="grid place-items-center">
              <div class="relative w-4 h-4">
                <div class="absolute inset-0 border border-white">
                  <div
                    v-if="isChecked"
                    class="absolute left-1/2 top-0 bottom-0 right-0 border-transparent border-2 rotate-45 scale-75 border-r-white border-b-white -translate-x-1 -translate-y-[2px]"
                  />
                </div>
              </div>
            </div>
          </template>
          Right Side Checkbox
        </BaseCheckbox>
      </div>

      <div class="border-b border-white py-2">
        <BaseCheckbox v-model="checked">
          <template #checkbox="{ isChecked }">
            <div class="grid place-items-center w-6">
              <div
                class="h-4 border-2 border-white transition-all duration-300"
                :class="[
                  isChecked
                    ? 'border-l-transparent border-t-transparent rotate-45 w-2'
                    : 'w-4'
                ]"
              ></div>
            </div>
          </template>

          Custom Checkbox
        </BaseCheckbox>
      </div>
    </div>
  </Story>
</template>
