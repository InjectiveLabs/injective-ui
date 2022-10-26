import { KeydownEvent } from './../types'

export const convertToNumericValue = (value: string, maxDecimals: number) => {
  if (value === '') {
    return value
  }

  const numericValue = `${parseFloat(value.replace(/[^.\d]/g, ''))}`

  if (numericValue.includes('.')) {
    const [wholeValue, decimalValue] = numericValue.split('.')

    const formattedDecimalValue =
      decimalValue.length > maxDecimals
        ? decimalValue.substring(0, maxDecimals)
        : decimalValue

    return `${Number(wholeValue)}.${formattedDecimalValue}`
  }

  return Number(numericValue)
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
