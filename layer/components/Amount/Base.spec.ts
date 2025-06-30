import { mountSuspended } from '@nuxt/test-utils/runtime'
import { BigNumber } from '@injectivelabs/utils'
import { describe, expect, it } from 'vitest'
import Base from './Base.vue'

describe('Amount/Base.vue', () => {
  it('renders with default props', async () => {
    const component = await mountSuspended(Base, {
      props: {
        amount: 1234.567
      }
    })

    expect(component.text()).toBe('1,234.56700000')
  })

  it('handles negative numbers', async () => {
    const component = await mountSuspended(Base, {
      props: {
        amount: -1234.567
      }
    })

    expect(component.text()).toBe('-1,234.56700000')
  })

  describe('showZeroAsEmDash', () => {
    it('should show em-dash when amount is 0 and prop is true', async () => {
      const component = await mountSuspended(Base, {
        props: {
          amount: 0,
          showZeroAsEmDash: true
        }
      })

      expect(component.text()).toContain('—')
    })

    it('should show 0 when amount is 0 and prop is false', async () => {
      const component = await mountSuspended(Base, {
        props: {
          amount: 0,
          decimals: 2,
          showZeroAsEmDash: false
        }
      })

      expect(component.text()).toBe('0.00')
    })
  })

  describe('abbreviation', () => {
    it('abbreviates numbers greater than abbreviationThreshold', async () => {
      const component = await mountSuspended(Base, {
        props: {
          amount: 1_000_000,
          shouldAbbreviate: true,
          abbreviationThreshold: 100_000
        }
      })
      expect(component.text()).toBe('1M')
    })

    it('abbreviates negative numbers', async () => {
      const component = await mountSuspended(Base, {
        props: {
          amount: -1_000_000,
          shouldAbbreviate: true,
          abbreviationThreshold: 100_000
        }
      })
      expect(component.text()).toBe('-1M')
    })

    it('does not abbreviate when shouldAbbreviate is false', async () => {
      const component = await mountSuspended(Base, {
        props: {
          decimals: 2,
          amount: 1_000_000,
          shouldAbbreviate: false,
          abbreviationThreshold: 100_000
        }
      })
      expect(component.text()).toBe('1,000,000.00')
    })
  })

  describe('subscript', () => {
    it('should use subscript for small numbers', async () => {
      const component = await mountSuspended(Base, {
        props: {
          useSubscript: true,
          amount: '0.00000123'
        }
      })

      expect(component.html()).toMatchInlineSnapshot(
        `"<span><!--v-if--><span>0.0<sub>5</sub>123</span></span>"`
      )
    })

    it('should use subscript for negative small numbers', async () => {
      const component = await mountSuspended(Base, {
        props: {
          useSubscript: true,
          amount: '-0.00000123'
        }
      })

      expect(component.html()).toMatchInlineSnapshot(
        `"<span><span>-</span><span>0.0<sub>5</sub>123</span></span>"`
      )
    })

    it('should respect subscriptDecimals', async () => {
      const component = await mountSuspended(Base, {
        props: {
          useSubscript: true,
          subscriptDecimals: 2,
          amount: '0.00000123456'
        }
      })

      expect(component.html()).toMatchInlineSnapshot(
        `"<span><!--v-if--><span>0.0<sub>5</sub>12</span></span>"`
      )
    })

    it('should not use subscript if decimal zeros are not over threshold', async () => {
      const component = await mountSuspended(Base, {
        props: {
          decimals: 6,
          amount: '0.000123',
          useSubscript: true,
          subscriptThresholdDecimals: 4
        }
      })
      expect(component.html()).not.toContain('<sub>')
      expect(component.text()).toBe('0.000123')
    })
  })

  describe('edge cases', () => {
    it('should display smaller than message for very small numbers', async () => {
      const component = await mountSuspended(Base, {
        props: {
          decimals: 8,
          amount: '0.000000001'
        }
      })

      expect(component.text()).toContain('<0.00000001')
    })

    it('should remove trailing zeros', async () => {
      const component = await mountSuspended(Base, {
        props: {
          decimals: 5,
          amount: '1.23000',
          noTrailingZeros: true
        }
      })

      expect(component.text()).toBe('1.23')
    })

    it('should remove trailing zeros and decimal point', async () => {
      const component = await mountSuspended(Base, {
        props: {
          decimals: 5,
          amount: '123.00000',
          noTrailingZeros: true
        }
      })

      expect(component.text()).toBe('123')
    })

    it('should not remove trailing zeros from integer part when decimals is 0', async () => {
      const component = await mountSuspended(Base, {
        props: {
          decimals: 0,
          amount: '100000',
          noTrailingZeros: true
        }
      })

      expect(component.text()).toBe('100,000')
    })

    it('should not remove trailing zeros from integer part with different number', async () => {
      const component = await mountSuspended(Base, {
        props: {
          decimals: 0,
          amount: '50000',
          noTrailingZeros: true
        }
      })

      expect(component.text()).toBe('50,000')
    })

    it('should handle large numbers with trailing zeros when decimals is 0', async () => {
      const component = await mountSuspended(Base, {
        props: {
          decimals: 0,
          amount: '1200000',
          noTrailingZeros: true
        }
      })

      expect(component.text()).toBe('1,200,000')
    })
  })

  describe('rounding', () => {
    it('should round down by default', async () => {
      const component = await mountSuspended(Base, {
        props: {
          decimals: 4,
          amount: '1.23456789'
        }
      })

      expect(component.text()).toBe('1.2345')
    })

    it('should round up when specified', async () => {
      const component = await mountSuspended(Base, {
        props: {
          decimals: 4,
          amount: '1.23451',
          roundingMode: BigNumber.ROUND_UP
        }
      })

      expect(component.text()).toBe('1.2346')
    })
  })
})
