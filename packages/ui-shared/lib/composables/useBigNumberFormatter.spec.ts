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

  describe('with decimal places', () => {
    test('from string', () => {
      const { valueToString } = useBigNumberFormatter(
        computed(() => number.toString()),
        { decimalPlaces: 2, roundingMode: BigNumber.ROUND_DOWN }
      )

      expect(valueToString.value).eq(
        new BigNumber(number.toString()).toFixed(2, BigNumber.ROUND_DOWN)
      )
    })
  })

  describe('with minimal decimal places', () => {
    test('from string with lower value than decimal places', () => {
      const { valueToString } = useBigNumberFormatter(
        computed(() => '0.001'),
        { minimalDecimalPlaces: 2 }
      )

      expect(valueToString.value).eq('< 0.01')
    })

    test('from string with higher value than decimal places', () => {
      const { valueToString } = useBigNumberFormatter(
        computed(() => '0.10'),
        { minimalDecimalPlaces: 2 }
      )

      expect(valueToString.value).eq('0.10')
    })
  })

  describe('with abbreviation floor', () => {
    test('with number lower than abbreviation floor ', () => {
      const { valueToString } = useBigNumberFormatter(
        computed(() => '13999888'),
        { abbreviationFloor: 14000000 }
      )

      expect(valueToString.value).eq('13,999,888.00')
    })

    test('with number higher than abbreviation floor ,near ceiling ', () => {
      const { valueToString } = useBigNumberFormatter(
        computed(() => '13999888'),
        { abbreviationFloor: 13000000 }
      )

      expect(valueToString.value).eq('≈14M')
    })

    test('with number higher than abbreviation floor, near floor ', () => {
      const { valueToString } = useBigNumberFormatter(
        computed(() => '13199888'),
        { abbreviationFloor: 13000000 }
      )

      expect(valueToString.value).eq('≈13M')
    })

    test('with number higher than abbreviation floor, exact number ', () => {
      const { valueToString } = useBigNumberFormatter(
        computed(() => '13000000'),
        { abbreviationFloor: 13000000 }
      )

      expect(valueToString.value).eq('13M')
    })
  })

  describe('with rounding mode', () => {
    test('from string, round down ', () => {
      const { valueToString } = useBigNumberFormatter(
        computed(() => number.toString()),
        { roundingMode: BigNumber.ROUND_DOWN }
      )

      expect(valueToString.value).eq(
        new BigNumber(number).toFixed(2, BigNumber.ROUND_DOWN)
      )
    })

    test('from undefined ', () => {
      const { valueToString } = useBigNumberFormatter(
        computed(() => undefined),
        { roundingMode: BigNumber.ROUND_DOWN }
      )

      expect(valueToString.value).eq('0.00')
    })
  })

  describe('with inj', () => {
    test('from string ', () => {
      const { valueWithGasBufferToString, valueToBigNumber } =
        useBigNumberFormatter(
          computed(() => '1.0000000000000000'),
          { injFee: 0.001, decimalPlaces: 5 }
        )

      expect(valueWithGasBufferToString.value).eq(
        valueToBigNumber.value.minus(0.001).toFixed(5)
      )
    })
  })
})
