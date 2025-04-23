<script lang="ts" setup>
const { messages } = useI18n()
const { copy } = useClipboard()

const differences = ref<Record<string, any>>({})

const languages = computed(() => Object.keys(messages.value).filter((lang) => !['en', 'enOnly'].includes(lang)))

function copyContent() {
  copy(JSON.stringify(differences.value, null, 2))
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

      if (!(key in target)) {
        missing[key] = isObject ? deepClone(sourceValue) : sourceValue
      }
      else if (isObject) {
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
        <button v-for="(lang, index) in languages" :key="index" type="button" class="flex items-center rounded-lg font-semibold outline-none justify-center p-2 text-sm h-[30px] max-h-[30px] bg-brand-600 hover:bg-opacity-80" @click="findMissingLocales(lang)">
          <div class="flex items-center gap-1">
            <span>{{ lang }}</span>
          </div>
        </button>
      </div>

      <button v-if="Object.keys(differences).length > 0" type="button" class="flex items-center rounded-lg font-semibold outline-none justify-center p-2 text-sm h-[30px] max-h-[30px] bg-brand-600 hover:bg-opacity-80" @click="copyContent">
          <div class="flex items-center gap-1">
            <span>Copy</span>
          </div>
        </button>
    </article>

    <div class="flex items-start gap-2 text-sm mt-4">
      <pre class="text-wrap">{{ differences }}</pre>
    </div>
  </div>
</template>
