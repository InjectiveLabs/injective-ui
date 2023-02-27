import { computed } from 'vue'
import { describe, expect, test } from 'vitest'
import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { useBigNumberFormatter } from '../../lib/composables/useBigNumberFormatter'

const number = Math.random()

describe('useBigNumberFormatter', () => {
  describe('should return a big number', () => {
    test('from string', () => {
      const { valueToBigNumber } = useBigNumberFormatter(
        computed(() => number.toString())
      )

      expect(valueToBigNumber.value.toFixed()).eq(
        new BigNumber(number.toString()).toFixed()
      )
      expect(valueToBigNumber.value.toNumber()).eq(number)
    })

    test('from number', () => {
      const { valueToBigNumber } = useBigNumberFormatter(computed(() => number))

      expect(valueToBigNumber.value.toFixed()).eq(
        new BigNumber(number.toString()).toFixed()
      )
      expect(valueToBigNumber.value.toNumber()).eq(number)
    })

    test('from BigNumberInBase', () => {
      const { valueToBigNumber } = useBigNumberFormatter(
        computed(() => new BigNumberInBase(number))
      )

      expect(valueToBigNumber.value.toFixed()).eq(
        new BigNumber(number.toString()).toFixed()
      )
      expect(valueToBigNumber.value.toNumber()).eq(number)
    })

    test('from undefined', () => {
      const { valueToBigNumber } = useBigNumberFormatter(
        computed(() => undefined)
      )

      expect(valueToBigNumber.value.toFixed()).eq('0')
      expect(valueToBigNumber.value.toNumber()).eq(0)
    })
  })

  /*
  describe('with decimal places', () => {
    test('should return a big number', () => {
      //
    })
  })

  describe('with minimal decimal places', () => {
    //
  })

  describe('with abbreviation floor', () => {
    //
  })

  describe('with rounding mode', () => {
    //
  }) */
})
