<script lang="ts" setup>
import Datepicker from '@vuepic/vue-datepicker'
</script>

<template>
  <Datepicker v-bind="$attrs">
    <template #input-icon>
      <slot name="input-icon" />
    </template>

    <template #clear-icon>
      <slot name="clear-icon" />
    </template>
  </Datepicker>
</template>
