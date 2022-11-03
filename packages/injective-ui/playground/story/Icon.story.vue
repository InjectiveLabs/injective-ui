<script lang="ts" setup>
import { icons } from './../icons.json'
</script>

<template>
  <Story
    title="Icon component"
    :layout="{
      type: 'grid',
      width: 250
    }"
  >
    <Variant v-for="icon in icons" :key="`${icon}-story`" :title="`${icon}`">
      <BaseIcon :name="icon" md />
    </Variant>
  </Story>
</template>
