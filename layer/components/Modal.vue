<script setup lang="ts">
//

const props = withDefaults(
  defineProps<{
    ui?: object
    cardUi?: object
    appear?: boolean
    overlay?: boolean
    modelValue?: boolean
    transition?: boolean
    fullscreen?: boolean
    preventClose?: boolean
    class?: string | object | string[]
  }>(),
  {
    appear: false,
    overlay: true,
    transition: true,
    fullscreen: false,
    modelValue: false,
    preventClose: false,
    ui: () => ({}),
    class: () => '',
    cardUi: () => ({})
  }
)

const emit = defineEmits<{
  'update:modelValue': [modelValue: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  }
})
</script>

<template>
  <UModal
    v-model="isOpen"
    v-bind="{
      appear,
      overlay,
      transition,
      fullscreen,
      preventClose,
      class: props.class,
      ui
    }"
  >
    <UCard v-bind="{ ui: cardUi }">
      <template v-if="$slots.header" #header>
        <slot name="header" />
      </template>

      <slot />

      <template v-if="$slots.footer" #footer>
        <slot name="footer" />
      </template>
    </UCard>
  </UModal>
</template>
