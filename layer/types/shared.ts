import { NotificationType } from './enum'

export interface NotificationAction {
  key: string
  label: string
  callback: Function
}

export interface Notification {
  id: number
  type: NotificationType
  title: string
  description: string
  context: string /** a longer version of a description */
  createdAt: number
  timeout: number
  actions: NotificationAction[] | undefined
}

export interface NotificationOptions {
  title: string
  description?: string
  context?: string // (longer description)
  timeout?: number
  actions?: NotificationAction[]
}
