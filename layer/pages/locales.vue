<script lang="ts" setup>
const route = useRoute()
const sharedNotificationStore = useSharedNotificationStore()
const { copy } = useClipboard()
const { locales, messages } = useI18n()

const localeOptions = locales.value.filter((item) => item.code !== "en");

const differences = ref<Record<string, any>>({})

definePageMeta({
  middleware: [
    (to) => {
      if (to.path.includes("/locales") && to.query.devMode !== "true") {
        return navigateTo("/");
      }
    },
  ],
});

function copyContent() {
  copy(JSON.stringify(differences.value, null, 2))
  sharedNotificationStore.info({title: 'Differences copied'})
}

function findMissingLocales(lang: string) {
  differences.value = compareLocales(messages.value['en'], messages.value[lang])
}

function deepClone(obj: Record<string, any>) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  const clone: any = Array.isArray(obj) ? [] : {}

  for (const key in obj) {
      clone[key] = deepClone(obj[key])
  }
  return clone
}

function compareLocales(
    source: Record<string, any>,
    target: Record<string, any>,
): Record<string, any> {
    const missing: Record<string, any> = {}

    for (const key in source) {
      const sourceValue = source[key]
      const targetValue = target?.[key]

      const isObject = typeof sourceValue === 'object' &&
                        sourceValue !== null &&
                        !Array.isArray(sourceValue)

      if (target && !(key in target)) {
        missing[key] = isObject ? deepClone(sourceValue) : sourceValue
      } else if (isObject) {
        const nestedMissing = compareLocales(sourceValue, targetValue)
        if (Object.keys(nestedMissing).length > 0) {
            missing[key] = nestedMissing
        }
      }
    }

    return missing
}
</script>

<template>
  <div>
    <article class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <button v-for="(item, index) in localeOptions" :key="index" type="button" class="flex items-center rounded-lg font-semibold outline-none justify-center py-2 px-4 text-sm h-[30px] max-h-[30px] bg-ocean-500 hover:bg-opacity-80" @click="findMissingLocales(item.code)">
          <div class="flex items-center gap-1">
            <span>{{ item.longName }}</span>
          </div>
        </button>
      </div>

      <button v-if="Object.keys(differences).length > 0" type="button" class="flex items-center rounded-lg font-semibold outline-none justify-center py-2 px-4 text-sm h-[30px] max-h-[30px] bg-ocean-500 hover:bg-opacity-80" @click="copyContent">
          <div class="flex items-center gap-1">
            <span>Copy</span>
          </div>
        </button>
    </article>

    <div class="flex items-start gap-2 text-xs mt-4">
      <pre class="text-wrap">{{ differences }}</pre>
    </div>
  </div>
</template>
