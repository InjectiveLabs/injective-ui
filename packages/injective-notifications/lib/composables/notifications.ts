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

const notify = (options: NotificationOptions, type: NotificationType) => {
  const { title, timeout } = options

  const duration = timeout || 6000
  const id = state.idCounter++
  const description = options.description || ''

  state.notifications.push({
    id,
    type,
    title,
    description,
    createdAt: Date.now(),
    timeout: setTimeout(() => this.deactivate(id), duration),
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
  console.log(id)
}

const resumeDeactivation = (id: number) => {
  console.log(id)
}

const clear = () => {
  console.log('clear all notifications')
}

export default function useNotifications(): NotificationsPlugin {
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
