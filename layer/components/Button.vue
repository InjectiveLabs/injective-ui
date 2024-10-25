<script setup lang="ts">
defineOptions({
  inheritAttrs: true
})

const props = withDefaults(
  defineProps<{
    ui?: object
    type?: string
    size?: any
    icon?: string | undefined
    block?: boolean
    label?: string | undefined
    color?: any
    square?: boolean
    padded?: boolean
    class?: string | object | Array<string | object>
    leading?: boolean
    truncate?: boolean
    trailing?: boolean
    variant?: any
    loading?: boolean
    disabled?: boolean
    loadingIcon?: string
    leadingIcon?: string | undefined
    trailingIcon?: string | undefined
  }>(),
  {
    icon: undefined,
    type: 'button',
    size: undefined,
    block: false,
    label: undefined,
    color: undefined,
    class: '',
    padded: true,
    square: false,
    loading: false,
    variant: undefined,
    leading: false,
    disabled: false,
    trailing: false,
    truncate: false,
    leadingIcon: undefined,
    loadingIcon: undefined,
    trailingIcon: undefined,
    ui: () => ({})
  }
)
</script>

<template>
  <UButton v-bind="{ ...$attrs, ...props }">
    <template v-if="$slots.leading" #leading>
      <slot name="leading" />
    </template>

    <slot v-if="!loading" />

    <template v-if="$slots.trailing" #trailing>
      <slot name="trailing" />
    </template>
  </UButton>
</template>
