import { beforeEach, describe, expect, test } from 'vitest'
import { fireEvent, render, RenderResult } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import Input from '../../lib/components/Input.vue'

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

    test('on focus event', async () => {
      await userEvent.click(input)

      expect(result.emitted().focus.length).toEqual(1)
    })

    test('on blur event', async () => {
      await fireEvent.blur(input)

      expect(result.emitted().blur.length).toEqual(1)
    })

    test('on paste event', async () => {
      await userEvent.click(input)
      await userEvent.paste('14au322k9munkmx5wrchz9q30juf5wjgz2cfqku')

      expect(result.emitted()['update:modelValue']).toMatchObject([
        ['inj14au322k9munkmx5wrchz9q30juf5wjgz2cfqku']
      ])
    })
  })
})
