<script setup lang="ts">
import { computed, defineAsyncComponent, useAttrs } from 'vue'

const attrs = useAttrs()

const props = defineProps({
  xs: Boolean,
  sm: Boolean,
  md: Boolean,

  name: {
    type: String,
    required: true
  }
})

const filteredAttrs = computed(() => {
  const filteredAttrs = { ...attrs }

  const classes = (filteredAttrs.class as string) || ''
  const defaultClasses: string[] = []

  if (!classes.includes('cursor-')) {
    defaultClasses.push('cursor-pointer')
  }

  if (
    !classes.includes('w-') &&
    !classes.includes('h-') &&
    !classes.includes('min-w-')
  ) {
    if (props.xs) {
      defaultClasses.push('h-2 w-2 min-w-2')
    } else if (props.sm) {
      defaultClasses.push('h-3 w-3 min-w-3')
    } else if (props.md) {
      defaultClasses.push('h-4 w-4 min-w-4')
    } else {
      defaultClasses.push('h-6 w-6 min-w-6')
    }
  }

  return { ...attrs, class: [...defaultClasses, classes].join(' ') }
})

/* temp fix: vite dev not dont support dynamic path
  https://github.com/vitejs/vite/issues/4945
  https://vitejs.dev/guide/features.html#glob-import
*/
const dynamicComponent = defineAsyncComponent(() => {
  let name = props.name

  if (name.includes('ledger-legacy')) {
    name = 'wallet/ledger'
  }

  if (name.includes('ledger')) {
    name = 'wallet/ledger'
  }

  return new Promise((resolve, _reject) => {
    const comps = import.meta.glob('./../../lib/icons/**/*.vue')

    try {
      return comps[`../icons/${name}.vue`]().then((component: any) =>
        resolve(component.default)
      )
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log({ e, name })
    }
  })
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false
}
</script>

<template>
  <component v-bind="filteredAttrs" :is="dynamicComponent" />
</template>
