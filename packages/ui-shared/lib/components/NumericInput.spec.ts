import { beforeEach, describe, expect, test } from 'vitest'
import { render, RenderResult, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import NumericInput from './NumericInput.vue'

describe('NumericInput component', () => {
  describe('UX behavior works', () => {
    let result = {} as RenderResult
    let input: Element

    beforeEach(async () => {
      result = render(NumericInput, {
        props: { modelValue: '' }
      })
      input = await result.container.getElementsByTagName('INPUT')[0]
    })

    test('on keydown string values', async () => {
      await userEvent.click(input)
      await userEvent.keyboard('s')

      expect(result.emitted()['update:modelValue']).toEqual(undefined)
    })

    test('on keydown numeric values', async () => {
      await userEvent.click(input)
      await userEvent.keyboard('1')

      expect(result.emitted()['update:modelValue']).toMatchObject([['1']])
    })

    test('on keydown . char with maxDecimals not 0', async () => {
      await userEvent.click(input)
      await userEvent.keyboard('0.1')

      expect(result.emitted()['update:modelValue']).toContainEqual(['0.1'])
    })

    test('on keydown invalid char', async () => {
      await userEvent.click(input)
      await userEvent.keyboard('-')

      expect(result.emitted()['update:modelValue']).toEqual(undefined)
    })
  })

  describe('UX behavior edge case works', () => {
    test('on keydown . char with maxDecimals not 0', async () => {
      const result = render(NumericInput, { props: { maxDecimals: 0 } })
      const input = await result.container.getElementsByTagName('INPUT')[0]

      await userEvent.click(input)
      await userEvent.keyboard('0.1')

      expect(result.emitted()['update:modelValue']).not.toContainEqual(['0.1'])
    })

    test('on keydown staring with . char', async () => {
      const result = render(NumericInput, { props: { maxDecimals: 2 } })
      const input = await result.container.getElementsByTagName('INPUT')[0]

      await userEvent.click(input)
      await userEvent.keyboard('.01')

      expect(result.emitted()['update:modelValue']).toContainEqual(['0.01'])
    })
  })

  describe('serialization works', () => {
    let result = {} as RenderResult
    let input: Element

    beforeEach(async () => {
      result = render(NumericInput, {
        props: { maxDecimals: 2 }
      })
      input = await result.container.getElementsByTagName('INPUT')[0]
    })

    test('on clipboard pasting', async () => {
      await userEvent.click(input)
      await userEvent.paste(
        'combination 123 of .123 string 456 ,numbers and special !@#$%^&*() characters'
      )

      expect(result.emitted()['update:modelValue']).toContainEqual(['123.12'])
    })

    test('on entering value exceeding max decimal', async () => {
      await userEvent.click(input)
      await userEvent.keyboard('1.123')

      // debounce
      await waitFor(
        () => {
          expect(result.emitted()['update:modelValue'].at(-1)).toEqual(['1.12'])
        },
        { timeout: 5000 }
      )
    })
  })
})
