export const getCommaFormatFromLocale = () => {
  const USER_LOCALE = new Intl.NumberFormat().resolvedOptions().locale
  const IS_COMMA_DECIMAL =
    (0.1).toLocaleString().replace(/\d/g, '') === ',' ||
    ['en-GB'].includes(USER_LOCALE)
  const DECIMAL_DIVIDER = IS_COMMA_DECIMAL ? ',' : '.'
  const THOUSAND_DIVIDER = IS_COMMA_DECIMAL ? '.' : ','

  return { DECIMAL_DIVIDER, THOUSAND_DIVIDER }
}
