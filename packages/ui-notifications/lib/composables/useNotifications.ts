// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: resolved with Nuxt
import { reactive } from 'vue'
import {
  NotificationData,
  NotificationOptions,
  NotificationsPlugin,
  NotificationType
} from '../types'

const state = reactive({
  notifications: [] as Array<NotificationData>,
  idCounter: 0
})

export default function useNotifications(): NotificationsPlugin {
  const notify = (options: NotificationOptions, type: NotificationType) => {
    const { title, timeout } = options

    const duration = timeout || 60000
    const id = state.idCounter++
    const description = options.description || ''

    state.notifications.push({
      id,
      type,
      title,
      description,
      createdAt: Date.now(),
      timeout: setTimeout(() => deactivate(id), duration),
      timeoutStartedAt: Date.now(),
      timeoutRemainder: duration,
      timeoutDuration: duration,
      paused: false,
      showDeactivationTimer: false,
      actions: options.actions
    } as NotificationData)
  }

  const error = (options: NotificationOptions) => {
    notify(options, NotificationType.Error)
  }

  const warning = (options: NotificationOptions) => {
    notify(options, NotificationType.Warning)
  }

  const success = (options: NotificationOptions) => {
    notify(options, NotificationType.Success)
  }

  const info = (options: NotificationOptions) => {
    notify(options, NotificationType.Info)
  }

  const deactivate = (id: number) => {
    const notifications = [...state.notifications]
    const index = notifications.findIndex((n: NotificationData) => n.id === id)

    if (index === -1) {
      return
    }

    const notification = notifications[index]
    clearTimeout(notification.timeout)

    state.notifications.splice(index, 1)
  }

  const pauseDeactivation = (id: number) => {
    const notifications = [...state.notifications]
    const notification = notifications.find(
      (n: NotificationData) => n.id === id
    )

    if (!notification) {
      return
    }

    clearTimeout(notification.timeout)

    notification.paused = true
    notification.timeoutRemainder -= Date.now() - notification.timeoutStartedAt
  }

  const resumeDeactivation = (id: number) => {
    const notifications = [...state.notifications]
    const notification = notifications.find(
      (n: NotificationData) => n.id === id
    )

    if (!notification) {
      return
    }

    notification.timeoutStartedAt = Date.now()
    notification.paused = false

    if (notification.timeoutRemainder > 0) {
      notification.timeout = setTimeout(
        () => deactivate(id),
        notification.timeoutRemainder
      )
      return
    }

    deactivate(id)
  }

  const clear = () => {
    state.notifications.forEach((n: NotificationData) => {
      deactivate(n.id)
    })
  }

  return {
    state,
    error,
    warning,
    success,
    info,
    deactivate,
    pauseDeactivation,
    resumeDeactivation,
    clear
  }
}
