<script lang="ts" setup>
const selectedDate = ref()
</script>

<template>
  <Story title="datepicker component">
    <div class="h-screen p-4">
      <BaseDatepicker
        v-model="selectedDate"
        range
        auto-apply
        :max-date="new Date()"
        placeholder="Time Range"
      >
        <template #input-icon>
          <BaseIcon name="calendar" class="ml-3 min-w-4 h-4 w-4" />
        </template>

        <template #clear-icon>
          <BaseIcon name="close" class="mr-1 min-w-4 h-4 w-4" />
        </template>
      </BaseDatepicker>
    </div>
  </Story>
</template>
