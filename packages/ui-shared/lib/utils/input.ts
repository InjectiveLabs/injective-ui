import { KeydownEvent } from './../types'

const MAXIMUM_ALLOWED_VALUE = 10 ** 18

const formatDecimalPlacesByLimit = (value: string, maxDecimals: number) => {
  return value.length > maxDecimals ? value.substring(0, maxDecimals) : value
}

export const stripNonDigits = (value: string) => {
  return parseFloat(value.replace(/[^.\d]/g, ''))
}

export const convertToNumericValue = (value: string, maxDecimals: number) => {
  if (value === '') {
    return value
  }

  const [wholeValue, decimalValue] = value.split('.')

  const formattedWholeNumber = parseFloat(wholeValue)

  if (formattedWholeNumber > MAXIMUM_ALLOWED_VALUE) {
    return 0
  }

  if (decimalValue) {
    return `${formattedWholeNumber}.${formatDecimalPlacesByLimit(
      decimalValue,
      maxDecimals
    )}`
  }

  return formattedWholeNumber
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
