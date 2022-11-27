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
          {{ item }}
        </BaseSortableHeaderItem>
      </div>
    </div>
  </Story>
</template>
