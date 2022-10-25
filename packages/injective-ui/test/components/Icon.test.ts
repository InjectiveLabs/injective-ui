import { describe, expect, test } from 'vitest'
import { render, waitFor } from '@testing-library/vue'
import Icon from '../../lib/components/Icon.vue'

describe('Icon component', () => {
  describe('size classes renders correctly', () => {
    test.concurrent('for default size button', async () => {
      const { container } = render(Icon, { props: { name: 'arrow' } })

      await waitFor(() => {
        expect(
          container.getElementsByClassName('h-6 w-6 min-w-6').length
        ).toEqual(1)
      })
    })

    test.concurrent('with xs prop', async () => {
      const { container } = render(Icon, { props: { name: 'arrow', xs: true } })

      await waitFor(() => {
        expect(
          container.getElementsByClassName('h-2 w-2 min-w-2').length
        ).toEqual(1)
      })
    })

    test.concurrent('with sm prop', async () => {
      const { container } = render(Icon, { props: { name: 'arrow', sm: true } })

      await waitFor(() => {
        expect(
          container.getElementsByClassName('h-3 w-3 min-w-3').length
        ).toEqual(1)
      })
    })

    test.concurrent('with md prop', async () => {
      const { container } = render(Icon, { props: { name: 'arrow', md: true } })

      await waitFor(() => {
        expect(
          container.getElementsByClassName('h-4 w-4 min-w-4').length
        ).toEqual(1)
      })
    })

    test.concurrent('with custom class', async () => {
      const { container } = render(Icon, {
        attrs: { class: 'w-10 h-10 min-w-10' },
        props: { name: 'arrow', md: true }
      })

      await waitFor(() => {
        expect(
          container.getElementsByClassName('w-10 h-10 min-w-10').length
        ).toEqual(1)
      })
    })
  })
})
