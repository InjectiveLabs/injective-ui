<script lang="ts" setup>
import { NuxtUiIcons } from '../../types'

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
  <div>
    <UIcon
      v-if="!hideIcon"
      :name="icon || NuxtUiIcons.EmptyData"
      :class="iconClass || 'size-6 mb-4'"
    />
    <p :class="textClass || 'text-white text-sm text-center'">
      {{ text || $t('common.noItems') }}
    </p>
  </div>
</template>
