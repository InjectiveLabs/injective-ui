import { KeydownEvent } from './../types'

const MAXIMUM_ALLOWED_VALUE = 10 ** 18

export const convertToNumericValue = (value: string, maxDecimals: number) => {
  if (value === '' || Number(value) === 0) {
    return value
  }

  const numericValue = parseFloat(value.replace(/[^.\d]/g, ''))

  if (numericValue > MAXIMUM_ALLOWED_VALUE) {
    return 0
  }

  if (numericValue % 1 !== 0) {
    const [wholeValue, decimalValue] = numericValue.toString().split('.')

    const formattedDecimalValue =
      decimalValue.length > maxDecimals
        ? decimalValue.substring(0, maxDecimals)
        : decimalValue

    return `${wholeValue}.${formattedDecimalValue}`
  }

  return numericValue
}

export const passNumericInputValidation = (
  event: KeydownEvent<HTMLInputElement>,
  additionalInvalidChars: string[] = []
): boolean => {
  if (!event.key) {
    return true
  }

  const invalidChars = ['-', '+', 'e']

  return ![...invalidChars, ...additionalInvalidChars].includes(event.key)
}
