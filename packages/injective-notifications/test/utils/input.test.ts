import { describe, expect, test } from 'vitest'
import {
  convertToNumericValue,
  passNumericInputValidation
} from '../../lib/utils/input'
import { KeydownEvent } from '../../lib/types'

describe('utils input helper functions', () => {
  describe('convertToNumericValue', () => {
    test('handles empty value arg correctly', () => {
      expect(convertToNumericValue('', 0)).toEqual('')
    })
  })

  describe('passNumericInputValidation', () => {
    test('handles event without key arg correctly', () => {
      expect(
        passNumericInputValidation({} as KeydownEvent<HTMLInputElement>)
      ).toEqual(true)
    })
  })
})
