<script setup lang="ts">
const activePanel = ref<number | undefined>(undefined)

const faq = [
  {
    header: 'Header 1',
    content: 'Content 1 - Lorem Ipsum Dolum'
  },
  {
    header: 'Header 2',
    content: 'Content 2 - Lorem Ipsum Dolum'
  },
  {
    header: 'Header 3',
    content: 'Content 3 - Lorem Ipsum Dolum'
  }
]
</script>

<template>
  <Story name="accordion">
    <div class="p-4 dark:text-white">
      <div class="divide-y">
        <BaseAccordion
          v-for="(panel, index) in faq"
          :key="`panel-${index}`"
          v-bind="{ value: index }"
          v-model="activePanel"
        >
          <template #header="{ active }">
            <div class="p-2 flex justify-between items-center">
              <span class="text-xl">{{ panel.header }}</span>
              <span :class="[active ? '-rotate-90' : 'rotate-90']">
                &#10095;
              </span>
            </div>
          </template>
          <template #content>
            <div class="p-2">
              {{ panel.content }}
            </div>
          </template>
        </BaseAccordion>
      </div>
    </div>
  </Story>
</template>
