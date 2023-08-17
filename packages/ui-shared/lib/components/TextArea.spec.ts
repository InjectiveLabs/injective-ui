import { beforeEach, describe, expect, test } from 'vitest'
import { fireEvent, render, RenderResult } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import Textarea from './TextArea.vue'

describe('Textarea component', () => {
  describe('UX behavior works', () => {
    let result = {} as RenderResult
    let textarea: Element

    beforeEach(async () => {
      result = render(Textarea, {
        props: { modelValue: '111' }
      })
      textarea = await result.container.getElementsByTagName('textarea')[0]
    })

    test('on focus event', async () => {
      await userEvent.click(textarea)

      expect(result.emitted()['input:focused'].length).toEqual(1)
    })

    test('on blur event', async () => {
      await fireEvent.blur(textarea)

      expect(result.emitted()['input:blurred'].length).toEqual(1)
    })

    test('on paste event', async () => {
      await userEvent.click(textarea)
      await userEvent.paste('inj14au322k9munkmx5wrchz9q30juf5wjgz2cfqku')

      expect(result.emitted()['update:modelValue']).toMatchObject([
        ['inj14au322k9munkmx5wrchz9q30juf5wjgz2cfqku']
      ])
    })
  })
})
