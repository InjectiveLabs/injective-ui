import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'
import Usd from './Usd.vue'

describe('Amount/Usd.vue', () => {
  const testCases = [
    { input: '0.0000001', output: '$ <0.01' },
    { input: '-0.0000001', output: '-$ <0.01' },
    { input: '0.01100000', output: '$0.01' },
    { input: '1234.12345678', output: '$1,234.12' },
    { input: '1.01', output: '$1.01' },
    { input: '1.1', output: '$1.10' },
    { input: '1000000000.123', output: '$≈1B' },
    { input: '1234.1200000005253', output: '$1,234.12' },
    { input: '1.00030004', output: '$1.00' },
    { input: '1234.1234565253', output: '$1,234.12' },
    { input: '1234567', output: '$≈1.2M' },
    { input: '0.000000000001', output: '$ <0.01' },
    { input: '0.000000000001234', output: '$ <0.01' },
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
