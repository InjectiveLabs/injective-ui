<script setup lang="ts">
//

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    appear?: boolean
    overlay?: boolean
    transition?: boolean
    preventClose?: boolean
    fullscreen?: boolean
    class?: string | object | string[]
    ui?: object
  }>(),
  {
    appear: false,
    overlay: true,
    transition: true,
    fullscreen: false,
    modelValue: false,
    preventClose: false,
    class: () => '',
    ui: () => ({})
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
    <UCard>
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
