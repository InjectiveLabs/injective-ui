import { describe, expect, test } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import ModalWrapper from './../../components/ModalWrapper.vue'

describe('ModalWrapper component', () => {
  describe('renders correctly', () => {
    test.concurrent('with attrs class', async () => {
      const { container } = render(ModalWrapper, {
        attrs: { class: 'bg-gray-900' },
        props: { show: true }
      })

      await waitFor(() => {
        expect(container.getElementsByClassName('bg-gray-900').length).toEqual(
          1
        )
      })
    })
  })

  describe('UX behavior', () => {
    test('emit close event on clickOutside', async () => {
      const { container, emitted, getByText } = render(ModalWrapper, {
        attrs: { class: 'bg-gray-900' },
        props: { show: true },
        slots: { default: '<div>Test</div>' }
      })

      getByText('Test')
      await userEvent.click(container.getElementsByClassName('bg-gray-900')[0])

      expect(emitted().close.length).toEqual(1)

      cleanup()
    })

    test('emit close event on escape keypress', async () => {
      const { emitted, getByText } = render(ModalWrapper, {
        attrs: { class: 'bg-gray-900' },
        props: { show: true },
        slots: { default: '<div>Test</div>' }
      })

      getByText('Test')
      await userEvent.keyboard('{Escape}')

      expect(emitted().close.length).toEqual(1)

      cleanup()
    })

    test('do not emit close event on escape keypress', async () => {
      const { emitted } = render(ModalWrapper, {
        attrs: { class: 'bg-gray-900' },
        props: { show: false },
        slots: { default: '<div>Test</div>' }
      })

      await userEvent.keyboard('{Escape}')

      expect(emitted().close).toEqual(undefined)
    })
  })
})
