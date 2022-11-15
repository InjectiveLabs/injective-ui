<template>
  <Story
    title="Spinner component"
    :layout="{
      type: 'grid',
      width: 250
    }"
  >
    <Variant title="sm spinner Icon">
      <BaseSpinner
        class="h-4 w-4 border-4 border-t-blue-600 border-r-blue-600"
      />
    </Variant>

    <Variant title="md spinner Icon">
      <BaseSpinner
        class="border-t-primary-500 border-r-primary-500 h-8 w-8 border-[6px]"
      />
    </Variant>

    <Variant title="lg spinner Icon">
      <BaseSpinner
        class="border-t-accent-500 border-r-accent-500 h-12 w-12 border-8"
      />
    </Variant>
  </Story>
</template>
