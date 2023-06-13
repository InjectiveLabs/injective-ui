import { describe, expect, test } from 'vitest'
import { formatNotificationDescription } from './text'

describe('utils text functions', () => {
  describe('formatNotificationDescription', () => {
    test('handles conversion properly', () => {
      const descriptionWithLessThan60Chars =
        'Injective is a blockchain built for finance.'
      const descriptionWithMoreThan60Chars =
        'Injective is the only blockchain where developers can find robust out-of-the-box modules such as a completely decentralized orderbook that can be utilized to build a diverse array of sophisticated applications. '

      expect(
        formatNotificationDescription(descriptionWithLessThan60Chars)
      ).toEqual({
        description: descriptionWithLessThan60Chars,
        context: ''
      })

      expect(
        formatNotificationDescription(descriptionWithMoreThan60Chars)
      ).toEqual({
        description:
          'Injective is the only blockchain where developers can find r ...',
        context: descriptionWithMoreThan60Chars
      })
    })
  })
})
