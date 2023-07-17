<template>
  <Story title="Tooltip">
    <div class="h-screen p-4">
      <BaseTooltip class="inline-block">
        <BaseIcon name="circle-info" class="min-w-4 w-4 text-gray-600" />

        <template #content>
          <div class="max-w-[240px] p-2 text-sm">Random tooltip string</div>
        </template>
      </BaseTooltip>
    </div>
  </Story>
</template>
