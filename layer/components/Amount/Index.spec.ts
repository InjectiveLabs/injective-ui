import { mountSuspended } from '@nuxt/test-utils/runtime'
import { BigNumber } from '@injectivelabs/utils'
import { describe, expect, test } from 'vitest'
import Index from './Index.vue'

describe('Amount/Index.vue', () => {
  describe('default behavior', () => {
    const testCases = [
      { input: '0.01100000', output: '0.011' },
      { input: '1234.12345678', output: '1,234.123456' },
      { input: '1.01', output: '1.01' },
      { input: '1.1', output: '1.1' },
      { input: '1000000000.123', output: '≈1B' },
      { input: '1234.1200000005253', output: '1,234.12' },
      { input: '1.00030004', output: '1.0003' },
      { input: '1234.1234565253', output: '1,234.123456' },
      { input: '1234567', output: '≈1.2M' }
    ]

    test.each(testCases)(
      'formats $input to $output by default',
      async ({ input, output }) => {
        const component = await mountSuspended(Index, {
          props: {
            amount: input
          }
        })

        expect(component.text()).toBe(output)
      }
    )

    describe('small number subscripts', () => {
      const smallNumberCases = [
        '0.0000001',
        '-0.0000001',
        '0.000000000001',
        '0.000000000001234',
        '1.000000000001234'
      ]

      test.each(smallNumberCases)(
        'formats small number %s with subscripts',
        async (amount) => {
          const component = await mountSuspended(Index, {
            props: {
              amount
            }
          })
          expect(component.html()).toMatchSnapshot()
        }
      )
    })
  })

  describe('full value mode (no abbreviation)', () => {
    const props = {
      shouldAbbreviate: false,
      showSmallerThan: false
    }

    describe('with subscripts enabled', () => {
      const testCases = [
        { input: '0.0000001', expected: '0.0<sub>6</sub>1' },
        { input: '1000000000.123', expected: '1,000,000,000.123' },
        { input: '1234567', expected: '1,234,567' },
        { input: '0.000000000001234', expected: '0.0<sub>11</sub>1234' },
        { input: '1.000000000001234', expected: '1' } // This number is >= 1, so no subscript
      ]

      test.each(testCases)(
        'formats $input correctly with subscripts',
        async ({ input, expected }) => {
          const component = await mountSuspended(Index, {
            props: {
              amount: input,
              useSubscript: true,
              ...props
            }
          })

          expect(component.html()).toContain(expected)
        }
      )
    })

    describe('with subscripts disabled', () => {
      const testCases = [
        { input: '0.0000001', expected: '0' },
        { input: '1000000000.123', expected: '1,000,000,000.123' },
        { input: '1234567', expected: '1,234,567' },
        { input: '0.000000000001234', expected: '0' },
        { input: '1.000000000001234', expected: '1' }
      ]

      test.each(testCases)(
        'formats $input correctly without subscripts',
        async ({ input, expected }) => {
          const component = await mountSuspended(Index, {
            props: {
              amount: input,
              useSubscript: false,
              ...props
            }
          })

          expect(component.text()).toBe(expected)
        }
      )
    })
  })

  describe('abbreviation behavior', () => {
    test('abbreviates large numbers by default', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '2000001'
        }
      })

      expect(component.text()).toBe('≈2M')
    })

    test('does not abbreviate when shouldAbbreviate is false', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '2000000',
          shouldAbbreviate: false
        }
      })

      expect(component.text()).toBe('2,000,000')
    })

    test('respects custom abbreviation threshold', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '500001',
          abbreviationThreshold: 100000
        }
      })

      expect(component.text()).toBe('≈500K')
    })
  })

  describe('smaller than behavior', () => {
    test('shows "smaller than" for very small numbers by default', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '0.0000001'
        }
      })

      expect(component.html()).toContain('&lt;0.000001')
    })

    test('shows actual value when showSmallerThan is false', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '0.0000001',
          showSmallerThan: false
        }
      })

      expect(component.html()).toContain('0.0<sub>6</sub>1')
    })
  })

  describe('decimal precision', () => {
    test('respects custom decimals', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '1.123456789',
          decimals: 2
        }
      })

      expect(component.text()).toBe('1.12')
    })

    test('adjusts decimals for abbreviated numbers', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '1500001',
          decimals: 6
        }
      })

      expect(component.text()).toBe('≈1.5M')
    })
  })

  describe('trailing zeros', () => {
    test('removes trailing zeros by default', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '1.10000'
        }
      })

      expect(component.text()).toBe('1.1')
    })

    test('keeps trailing zeros when noTrailingZeros is false', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '1.10000',
          noTrailingZeros: false
        }
      })

      expect(component.text()).toBe('1.100000')
    })
  })

  describe('zero handling', () => {
    test('shows zero normally by default', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '0'
        }
      })

      expect(component.text()).toBe('0')
    })

    test('shows em-dash for zero when showZeroAsEmDash is true', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '0',
          showZeroAsEmDash: true
        }
      })

      expect(component.html()).toContain('—')
    })
  })

  describe('negative numbers', () => {
    test('handles negative numbers correctly', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '-1234.567'
        }
      })

      expect(component.text()).toBe('-1,234.567')
    })

    test('handles negative small numbers with subscripts', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '-0.0000123'
        }
      })

      expect(component.html()).toMatchInlineSnapshot(
        `"<span><span>-</span><span>0.0<sub>4</sub>123</span></span>"`
      )
    })

    test('handles negative numbers in full value mode', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '-0.0000123',
          shouldAbbreviate: false,
          showSmallerThan: false
        }
      })

      expect(component.html()).toMatchInlineSnapshot(
        `"<span><span>-</span><span>0.0<sub>4</sub>123</span></span>"`
      )
    })
  })

  describe('rounding modes', () => {
    test('uses ROUND_DOWN by default', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '1.999999',
          decimals: 2
        }
      })

      expect(component.text()).toBe('1.99')
    })

    test('respects custom rounding mode', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '1.999999',
          decimals: 2,
          roundingMode: BigNumber.ROUND_UP,
          noTrailingZeros: false
        }
      })

      expect(component.text()).toBe('2.00')
    })
  })

  describe('prop combinations', () => {
    test('full value mode with custom decimals', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '1000000.123456789',
          decimals: 4,
          shouldAbbreviate: false,
          showSmallerThan: false
        }
      })

      expect(component.text()).toBe('1,000,000.1234')
    })

    test('subscripts with custom threshold', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '0.001234',
          useSubscript: true,
          showSmallerThan: false
        }
      })

      expect(component.html()).toContain('0.001234')
    })

    test('no trailing zeros with custom decimals', async () => {
      const component = await mountSuspended(Index, {
        props: {
          amount: '1.5',
          decimals: 4,
          noTrailingZeros: true
        }
      })

      expect(component.text()).toBe('1.5')
    })
  })
})
