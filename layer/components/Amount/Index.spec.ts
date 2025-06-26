import { mountSuspended } from '@nuxt/test-utils/runtime'
import { BigNumberInBase } from '@injectivelabs/utils'
import { describe, expect, test } from 'vitest'
import Index from './Index.vue'

describe('Amount/Index.vue', () => {
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
          amount: new BigNumberInBase(input)
        }
      })

      expect(component.text()).toBe(output)
    }
  )

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
