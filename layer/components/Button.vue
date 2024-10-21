<script setup lang="ts">
defineOptions({
  inheritAttrs: true
})

const props = withDefaults(
  defineProps<{
    ui?: object
    type?: string
    size?: string
    icon?: string | null
    block?: boolean
    label?: string | null
    color?: string
    square?: boolean
    padded?: boolean
    class?: string | object | Array<string | object>
    leading?: boolean
    truncate?: boolean
    trailing?: boolean
    variant?: string
    loading?: boolean
    disabled?: boolean
    loadingIcon?: string
    leadingIcon?: string | null
    trailingIcon?: string | null
  }>(),
  {
    icon: null,
    type: 'button',
    size: undefined,
    block: false,
    label: null,
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
    leadingIcon: null,
    loadingIcon: undefined,
    trailingIcon: null,
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
