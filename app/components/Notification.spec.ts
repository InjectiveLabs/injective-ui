import { mount } from '@vue/test-utils'
import Notification from './Notification.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useSharedNotificationStore } from '../store/notification'
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest'
import { NotificationType } from '../types'
import type { Notification as NotificationData } from '../types'

const notification: NotificationData = {
  id: 10_000,
  title: 'Test notification',
  timeout: 6000,
  context: '',
  createdAt: 10_000,
  description: '',
  type: NotificationType.Info,
  actions: undefined
}

describe('Notification.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('closes after its timeout', async () => {
    vi.useFakeTimers()

    mount(Notification, { props: { notification } })

    const notificationStore = useSharedNotificationStore()
    const clear = vi.spyOn(notificationStore, 'clear')

    vi.advanceTimersByTime(5999)
    expect(clear).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(clear).toHaveBeenCalledOnce()
    expect(clear).toHaveBeenCalledWith(notification.id)
  })

  it('tracks the remaining timeout across multiple pauses', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(10_000)

    const component = mount(Notification, {
      props: { notification }
    })

    const notificationStore = useSharedNotificationStore()
    const clear = vi.spyOn(notificationStore, 'clear')
    const toast = component.get('.ui-notification')

    vi.advanceTimersByTime(1000)
    await toast.trigger('mouseenter')
    vi.advanceTimersByTime(2000)
    expect(clear).not.toHaveBeenCalled()

    await toast.trigger('mouseleave')
    vi.advanceTimersByTime(1000)
    await toast.trigger('mouseenter')
    vi.advanceTimersByTime(2000)
    expect(clear).not.toHaveBeenCalled()

    await toast.trigger('mouseleave')
    vi.advanceTimersByTime(3999)
    expect(clear).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(clear).toHaveBeenCalledOnce()
    expect(clear).toHaveBeenCalledWith(notification.id)
  })
})
