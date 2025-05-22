import type { NotificationType } from './enum'

export interface SharedDropdownOption {
  value: string
  display: string
  description?: string
}

export interface NotificationAction {
  key?: string
  label: string
  class?: string
  callback: Function
}

export interface NotificationOptions {
  key?: string
  title: string
  icon?: string
  timeout?: number
  context?: string // (longer description)
  description?: string
  actions?: NotificationAction[]
}

export interface Notification {
  id: number
  key?: string
  icon?: string
  title: string
  timeout: number
  context: string /** a longer version of a description */
  createdAt: number
  description: string
  type: NotificationType
  actions: undefined | NotificationAction[]
}
