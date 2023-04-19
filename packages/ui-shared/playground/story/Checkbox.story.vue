<script setup lang="ts">
const checked = ref(false)
</script>

<template>
  <Story title="checkbox">
    <div class="p-2 max-w-lg space-y-4 text-white">
      <div class="border-b border-white py-2">
        <BaseCheckbox v-model="checked"> Default Checkbox </BaseCheckbox>
      </div>

      <div class="border-b border-white py-2">
        <BaseCheckbox
          v-model="checked"
          sm
          border-color="border-blue-600"
          check-color="border-r-blue-600 border-b-blue-600"
        >
          <span class="text-sm">sm Checkbox</span>
        </BaseCheckbox>
      </div>

      <div class="border-b border-white py-2">
        <BaseCheckbox v-model="checked" lg> lg Checkbox </BaseCheckbox>
      </div>

      <div class="border-b border-white py-2 flex justify-end">
        <BaseCheckbox v-model="checked" checkbox-on-right>
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

      <div>
        <BaseCheckbox v-model="checked" lg>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Placeat
          doloremque quidem esse illum tenetur. Consequuntur modi expedita qui!
          Consequuntur, aliquid! Distinctio doloribus pariatur, harum assumenda
          nobis, nostrum quasi fuga, accusamus veritatis dolor culpa ea debitis
          impedit quam cumque tenetur commodi.
        </BaseCheckbox>
      </div>
    </div>
  </Story>
</template>
