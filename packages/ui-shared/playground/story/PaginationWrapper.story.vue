<script lang="ts" setup>
const page = ref(1)
const limit = ref(10)
const totalCount = 100
</script>

<template>
  <Story title="Pagination wrapper">
    <pre>Page: {{ page }}</pre>
    <pre>Limit: {{ limit }}</pre>

    <BasePaginationWrapper
      v-model:page="page"
      v-model:limit="limit"
      class="flex flex-wrap items-center justify-between text-sm max-w-[800px]"
      v-bind="{ totalCount }"
    >
      <template #summary="{ from, to }">
        <span>From {{ from }} to {{ to }} total {{ totalCount }}</span>
      </template>

      <template
        #default="{
          hasPrevPage,
          hasNextPage,
          handleClickEvent,
          handleNextEvent,
          handlePrevEvent,
          pagesToDisplay
        }"
      >
        <div
          class="text-2xs tracking-1.5 flex items-center justify-center text-center"
        >
          <span
            :class="hasPrevPage ? 'cursor-pointer text-black' : 'text-gray-600'"
            @click="handlePrevEvent"
          >
            <BaseIcon name="caret-thin" class="h-auto w-3" />
          </span>

          <div class="mx-3 flex items-center gap-0.5 text-sm font-semibold">
            <BaseSelectorItem
              v-for="(displayPage, index) in pagesToDisplay"
              :key="`pagination-page-${displayPage}-${index}`"
              :model-value="page"
              :value="displayPage"
              class="cursor-pointer"
              @update:model-value="handleClickEvent"
            >
              <template #default="{ active }">
                <span :class="{ 'text-blue-600': active }">
                  {{ displayPage }}
                </span>
              </template>
            </BaseSelectorItem>
          </div>

          <span
            :class="hasNextPage ? 'cursor-pointer text-black' : 'text-gray-600'"
            @click="handleNextEvent"
          >
            <BaseIcon name="caret-thin" class="h-auto w-3 -rotate-180" />
          </span>
        </div>
      </template>

      <template #row-select="{ rowOptions, handleUpdateLimit }">
        <div class="flex gap-1">
          <span
            v-for="option in rowOptions"
            :key="`row-option-${option}`"
            class="cursor-pointer"
            @click="handleUpdateLimit(option)"
          >
            {{ option }}
          </span>
        </div>
      </template>
    </BasePaginationWrapper>
  </Story>
</template>
