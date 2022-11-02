import { KeydownEvent } from './../types'

export const convertToNumericValue = (value: string, maxDecimals: number) => {
  if (value === '') {
    return value
  }

  const numericValuePattern = /^(\.|0|[1-9])\d*(\.\d+)?$/
  const isNumericValue = numericValuePattern.test(value)

  if (!isNumericValue) {
    return ''
  }

  // Number function cuts off at 18 digits
  if (value.includes('.')) {
    const [wholeValue, decimalValue] = value.split('.')

    const formattedDecimalValue =
      decimalValue.length > maxDecimals
        ? decimalValue.substring(0, maxDecimals)
        : decimalValue

    return `${Number(wholeValue)}.${formattedDecimalValue}`
  }

  return Number(value)
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
