import { beforeEach, describe, expect, test } from 'vitest'
import { render, RenderResult } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import Input from './Input.vue'

describe('Input component', () => {
  describe('UX behavior works', () => {
    let result = {} as RenderResult
    let input: Element

    beforeEach(async () => {
      result = render(Input, {
        props: { modelValue: 'inj' }
      })
      input = await result.container.getElementsByTagName('INPUT')[0]
    })

    test('on paste event', async () => {
      await userEvent.click(input)
      await userEvent.paste('14au322k9munkmx5wrchz9q30juf5wjgz2cfqku')

      expect(result.emitted()['update:modelValue']).toMatchObject([
        ['inj14au322k9munkmx5wrchz9q30juf5wjgz2cfqku']
      ])
    })
  })

  describe('UX behavior edge case works', () => {
    let result = {} as RenderResult
    let input: Element

    beforeEach(async () => {
      result = render(Input, {
        props: { modelValue: 'inj', clearOnPaste: true }
      })
      input = await result.container.getElementsByTagName('INPUT')[0]
    })

    test('on paste event clears previous input', async () => {
      await userEvent.click(input)
      await userEvent.paste('14au322k9munkmx5wrchz9q30juf5wjgz2cfqku')

      expect(result.emitted()['update:modelValue']).toMatchObject([
        ['14au322k9munkmx5wrchz9q30juf5wjgz2cfqku']
      ])
    })
  })
})
