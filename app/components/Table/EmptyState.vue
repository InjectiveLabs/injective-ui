<script lang="ts" setup>
import { NuxtUiIcons } from '../../types'

const sharedWalletStore = useSharedWalletStore()

withDefaults(
  defineProps<{
    text?: string
    icon?: string
    hideIcon?: boolean
    iconClass?: string
    textClass?: string
  }>(),
  {
    text: '',
    icon: '',
    iconClass: '',
    textClass: ''
  }
)
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <template
      v-if="$slots['disconnect-text'] && !sharedWalletStore.isUserConnected"
    >
      <slot name="disconnect-text" />
    </template>

    <template v-else>
      <UIcon
        v-if="!hideIcon"
        :class="iconClass || 'size-6 mb-4'"
        :name="icon || NuxtUiIcons.EmptyData"
      />
      <p :class="textClass || 'text-white text-sm text-center'">
        {{ text || $t('common.noItems') }}
      </p>
    </template>
  </div>
</template>
