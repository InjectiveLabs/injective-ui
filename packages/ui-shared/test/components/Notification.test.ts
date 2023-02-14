import { describe, expect, test } from 'vitest'
import { render, waitFor } from '@testing-library/vue'
import Notification from '../../lib/components/Notification.vue'

describe('Notification component', () => {
  describe('renders correctly', () => {
    test.concurrent('title', async () => {
      const { container } = render(Notification, {
        props: {
          notification: {
            title: 'Notification title'
          }
        }
      })

      await waitFor(() => {
        expect(container.innerHTML).toContain('Notification title')
      })
    })
  })
})
