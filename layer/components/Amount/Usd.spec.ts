import { mountSuspended } from '@nuxt/test-utils/runtime'
import { BigNumber } from '@injectivelabs/utils'
import { describe, expect, test } from 'vitest'
import Usd from './Usd.vue'

describe('Amount/Usd.vue', () => {
  describe('default behavior', () => {
    const testCases = [
      { input: '0.0000001', output: '$<0.01' },
      { input: '-0.0000001', output: '-$<0.01' },
      { input: '0.01100000', output: '$0.01' },
      { input: '1234.12345678', output: '$1,234.12' },
      { input: '1.01', output: '$1.01' },
      { input: '1.1', output: '$1.10' },
      { input: '1000000000.123', output: '$≈1B' },
      { input: '1234.1200000005253', output: '$1,234.12' },
      { input: '1.00030004', output: '$1.00' },
      { input: '1234.1234565253', output: '$1,234.12' },
      { input: '1234567', output: '$≈1.2M' },
      { input: '0.000000000001', output: '$<0.01' },
      { input: '0.000000000001234', output: '$<0.01' },
      { input: '1.000000000001234', output: '$1.00' }
    ]

    test.each(testCases)(
      'formats $input to $output by default',
      async ({ input, output }) => {
        const component = await mountSuspended(Usd, {
          props: {
            amount: input
          },
          slots: {
            prefix: () => '$'
          }
        })
        expect(component.text()).toBe(output)
      }
    )
  })

  describe('full value mode (no abbreviation)', () => {
    const props = {
      shouldAbbreviate: false,
      showSmallerThan: false
    }

    describe('with subscripts enabled (default)', () => {
      const testCases = [
        { input: '0.0000001', expected: '$0.00' },
        { input: '1000000000.123', expected: '$1,000,000,000.12' },
        { input: '1234567', expected: '$1,234,567.00' },
        { input: '0.000000000001234', expected: '$0.00' },
        { input: '1.000000000001234', expected: '$1.00' },
        { input: '0.005678', expected: '$0.00' },
        { input: '0.001234', expected: '$0.00' }
      ]

      test.each(testCases)(
        'formats $input correctly with subscripts',
        async ({ input, expected }) => {
          const component = await mountSuspended(Usd, {
            props: {
              amount: input,
              ...props
            },
            slots: {
              prefix: () => '$'
            }
          })

          expect(component.text()).toBe(expected)
        }
      )
    })

    describe('without subscripts', () => {
      const testCases = [
        { input: '0.0000001', expected: '$0.00' },
        { input: '1000000000.123', expected: '$1,000,000,000.12' },
        { input: '1234567', expected: '$1,234,567.00' },
        { input: '0.000000000001234', expected: '$0.00' },
        { input: '1.000000000001234', expected: '$1.00' }
      ]

      test.each(testCases)(
        'formats $input correctly without subscripts',
        async ({ input, expected }) => {
          const component = await mountSuspended(Usd, {
            props: {
              amount: input,
              ...props
            },
            slots: {
              prefix: () => '$'
            }
          })

          expect(component.text()).toBe(expected)
        }
      )
    })
  })

  describe('abbreviation behavior', () => {
    test('abbreviates large numbers by default', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '2000001'
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$≈2M')
    })

    test('does not abbreviate when shouldAbbreviate is false', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '2000000',
          shouldAbbreviate: false
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$2,000,000.00')
    })

    test('handles very large numbers', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '1500000001'
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$≈1.5B')
    })
  })

  describe('smaller than behavior', () => {
    test('shows "smaller than" for very small numbers by default', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '0.0000001'
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$<0.01')
    })

    test('shows actual value when showSmallerThan is false', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '0.0000001',
          showSmallerThan: false
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$0.00')
    })

    test('handles edge case where value rounds down to zero', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '0.009999'
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$<0.01')
    })
  })

  describe('USD decimal precision', () => {
    test('always uses 2 decimal places for USD', async () => {
      const testCases = [
        { input: '1', output: '$1.00' },
        { input: '1.5', output: '$1.50' },
        { input: '1.567', output: '$1.56' },
        { input: '1.123456789', output: '$1.12' }
      ]

      for (const { input, output } of testCases) {
        const component = await mountSuspended(Usd, {
          props: {
            amount: input
          },
          slots: {
            prefix: () => '$'
          }
        })

        expect(component.text()).toBe(output)
      }
    })
  })

  describe('negative numbers', () => {
    test('handles negative numbers correctly', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '-1234.567'
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('-$1,234.56')
    })

    test('handles negative small numbers with "smaller than"', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '-0.0000123'
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('-$<0.01')
    })

    test('handles negative numbers in full value mode', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '-0.0000123',
          shouldAbbreviate: false,
          showSmallerThan: false
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('-$0.00')
    })
  })

  describe('rounding modes', () => {
    test('uses ROUND_DOWN by default', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '1.999'
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$1.99')
    })

    test('respects custom rounding mode', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '1.999',
          roundingMode: BigNumber.ROUND_UP
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$2.00')
    })

    test('rounding affects "smaller than" threshold', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '0.004',
          roundingMode: BigNumber.ROUND_DOWN
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$<0.01')
    })
  })

  describe('zero handling', () => {
    test('shows zero with proper USD formatting', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '0'
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$0.00')
    })

    test('handles zero with different rounding modes', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '0',
          roundingMode: BigNumber.ROUND_UP
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$0.00')
    })
  })

  describe('prop combinations', () => {
    test('full value mode with large numbers', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '1000000.123456789',
          shouldAbbreviate: false,
          showSmallerThan: false
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$1,000,000.12')
    })

    test('custom rounding with small numbers', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '0.0000567',
          roundingMode: BigNumber.ROUND_UP,
          showSmallerThan: false
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$0.01')
    })

    test('no abbreviation with edge case amounts', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '999999.99',
          shouldAbbreviate: false
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('$999,999.99')
    })
  })

  describe('slot behavior', () => {
    test('works without prefix slot', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '123.45'
        }
      })

      expect(component.text()).toBe('123.45')
    })

    test('works with custom prefix', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '123.45'
        },
        slots: {
          prefix: () => '€'
        }
      })

      expect(component.text()).toBe('€123.45')
    })

    test('prefix works with negative numbers', async () => {
      const component = await mountSuspended(Usd, {
        props: {
          amount: '-123.45'
        },
        slots: {
          prefix: () => '$'
        }
      })

      expect(component.text()).toBe('-$123.45')
    })
  })
})
