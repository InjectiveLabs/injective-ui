<script lang="ts" setup>
import { IS_HELIX } from './../utils/constant'

let Datepicker: any = null
if (!IS_HELIX) {
  // @ts-ignore
  import('@vuepic/vue-datepicker').then((module) => {
    Datepicker = module.default
  })
}
</script>

<template>
  <Datepicker v-if="!IS_HELIX && Datepicker" v-bind="$attrs">
    <template #input-icon>
      <slot name="input-icon" />
    </template>

    <template #clear-icon>
      <slot name="clear-icon" />
    </template>
  </Datepicker>
</template>
