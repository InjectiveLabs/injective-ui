import type { FactoryOpts } from 'imask'

export interface NumberLocaleConfig {
  radix: string
  mapToRadix: string[]
  name: 'us' | 'european'
  thousandsSeparator: string
}

let cachedLocale: null | NumberLocaleConfig = null

/* WIP */
function _detectNumberLocale(): NumberLocaleConfig {
  if (cachedLocale) {
    return cachedLocale
  }

  try {
    const browserLang = navigator?.language?.toLowerCase() ?? 'en-us'

    // European locales that use comma as decimal separator
    const commaDecimalLocales = [
      'af',
      'sq',
      'ar-dz',
      'ar-ma',
      'ar-tn',
      'az',
      'eu',
      'be',
      'bs',
      'bg',
      'ca',
      'hr',
      'cs',
      'da',
      'nl',
      'et',
      'fo',
      'fi',
      'fr',
      'gl',
      'ka',
      'de',
      'el',
      'is',
      'id',
      'it',
      'kk',
      'ky',
      'lv',
      'lt',
      'lb',
      'mk',
      'mn',
      'nb',
      'nn',
      'no',
      'pl',
      'pt',
      'ro',
      'ru',
      'sr',
      'sk',
      'sl',
      'es',
      'sv',
      'tr',
      'tk',
      'uk',
      'uz',
      'vi'
    ]

    const usesCommaDecimal = commaDecimalLocales.some((locale) =>
      browserLang.startsWith(locale)
    )

    cachedLocale = usesCommaDecimal
      ? {
          mapToRadix: [',', '.'],
          name: 'european',
          radix: ',',
          thousandsSeparator: '.'
        }
      : {
          mapToRadix: ['.', ','],
          name: 'us',
          radix: '.',
          thousandsSeparator: ','
        }

    return cachedLocale
  } catch {
    cachedLocale = {
      mapToRadix: ['.', ','],
      name: 'us',
      radix: '.',
      thousandsSeparator: ','
    }

    return cachedLocale
  }
}

/**
 * Creates IMask number configuration with sensible defaults.
 * Uses direct `mask: Number` (not pattern blocks) to avoid decimal/thousands separator bugs.
 *
 * @param options - Native IMask FactoryOpts. Passed options override defaults.
 * @returns IMask FactoryOpts
 *
 * @example
 * createIMaskConfig({
 *   scale: 2,
 *   min: 1,
 *   max: 50,
 *   autofix: true,
 *   thousandsSeparator: ',',
 *   radix: '.',
 *   mapToRadix: ['.', ',']
 * })
 */
export function createIMaskConfig(
  options: Partial<FactoryOpts> = {}
): FactoryOpts {
  const config: any = {
    mask: Number,
    radix: '.',
    mapToRadix: ['.', ','],
    thousandsSeparator: ',',
    lazy: false,
    normalizeZeros: true,
    padFractionalZeros: false,
    // Override format to handle empty values (0 should show as empty string when appropriate)
    format: (n: number) => {
      // When the number is 0, return empty string to allow empty inputs
      if (n === 0) {
        return ''
      }

      return n.toLocaleString('en-US', {
        useGrouping: false,
        maximumFractionDigits: 20
      })
    },
    ...options
  }

  return config as FactoryOpts
}

/**
 * Standard onAccept handler pattern for IMask number inputs.
 *
 * This pattern handles empty value edge cases to prevent 0 from being emitted
 * when forms are reset or fields are cleared, avoiding unwanted validation errors.
 *
 * **IMPORTANT**: The onAccept handler must be defined inline within the useIMask call.
 * You cannot extract it to a factory function because `typed` and `masked` refs
 * don't exist until after useIMask returns them.
 *
 * @example
 * ```typescript
 * const { el, typed, masked } = useIMask(
 *   computed(() => createIMaskConfig({ scale: 6 })),
 *   {
 *     onAccept: () => {
 *       // 1. Skip if no change
 *       if (props.modelValue === typed.value) {
 *         return
 *       }
 *
 *       // 2. Skip if modelValue is empty and typed is 0
 *       //    (prevents validation errors when resetForm sets empty values)
 *       if (props.modelValue === '' && (typed.value === '0' || typed.value === 0)) {
 *         return
 *       }
 *
 *       // 3. Emit empty string if user cleared the field
 *       if (typed.value === 0 && masked.value === '') {
 *         emit('update:modelValue', '')
 *
 *         return
 *       }
 *
 *       // 4. Otherwise emit typed value
 *       emit('update:modelValue', `${typed.value}`)
 *     }
 *   }
 * )
 * ```
 *
 * **Logic Breakdown:**
 * 1. **No change check**: Skip emission if modelValue === typed.value (prevents unnecessary updates)
 * 2. **Form reset check**: Skip emission if modelValue is '' and typed is 0 or '0'
 *    - When resetForm({ values: { field: '' } }) is called, IMask converts '' to 0
 *    - This check prevents emitting 0, which would trigger "required" validation errors
 * 3. **Empty field check**: Emit '' if typed is 0 but masked is '' (user manually cleared the field)
 * 4. **Normal case**: Otherwise emit typed value as string
 */
export const IMASK_ONACCEPT_PATTERN = `
onAccept: () => {
  if (props.modelValue === typed.value) {
    return
  }

  if (props.modelValue === '' && (typed.value === '0' || typed.value === 0)) {
    return
  }

  if (typed.value === 0 && masked.value === '') {
    emit('update:modelValue', '')

    return
  }

  emit('update:modelValue', \`\${typed.value}\`)
}
`.trim()
