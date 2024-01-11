<script lang="ts" setup>
import { Tooltip } from 'floating-vue'
</script>

<template>
  <Tooltip v-bind="$attrs">
    <div>
      <slot />
    </div>

    <template #popper>
      <slot name="content" />
    </template>
  </Tooltip>
</template>
