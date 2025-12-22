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
  return {
    mask: Number,
    radix: '.',
    mapToRadix: ['.', ','],
    thousandsSeparator: ',',
    lazy: false,
    normalizeZeros: true,
    padFractionalZeros: false,
    ...options
  } as FactoryOpts
}
