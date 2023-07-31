<script lang="ts" setup>
const example = ref()

onMounted(() => {
  example.value = baseToBalanceInToken({
    value: 100_000_000_000_000_000,
    decimalPlaces: 18
  })
})
</script>

<template>
  <div>{{ example }}</div>
</template>
