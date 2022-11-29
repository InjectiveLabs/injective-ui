<script lang="ts" setup>
const list = ['one', 'two', 'three']

const sortBy = ref('one')
const ascending = ref(false)
</script>

<template>
  <Story title="sortable header item">
    <div class="h-screen p-4">
      <div class="flex items-center gap-4">
        <BaseSortableHeaderItem
          v-for="item in list"
          :key="`sortable-header-item${item}`"
          v-model:sort-by="sortBy"
          v-model:ascending="ascending"
          :value="item"
        >
          <template #default="{ active }">
            <div class="flex cursor-pointer items-center gap-2">
              <span>{{ item }}</span>
              <div
                class="transition-all"
                :class="[
                  active ? 'text-blue-600' : 'text-gray-600',
                  {
                    'rotate-180': ascending && active
                  }
                ]"
              >
                <BaseIcon name="triangle" xs />
              </div>
            </div>
          </template>
        </BaseSortableHeaderItem>
      </div>
    </div>
  </Story>
</template>
