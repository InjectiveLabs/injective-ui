import { NotificationType } from './enum'

export interface NotificationAction {
  key?: string
  label: string
  callback: Function
  class?: string
}

export interface Notification {
  id: number
  key?: string
  title: string
  timeout: number
  createdAt: number
  description: string
  type: NotificationType
  isTemplateString?: boolean

  actions: NotificationAction[] | undefined
  context: string /** a longer version of a description */
}

export interface NotificationOptions {
  key?: string
  title: string
  timeout?: number
  description?: string
  isTemplateString?: boolean
  actions?: NotificationAction[]
  context?: string // (longer description)
}

export interface SharedDropdownOption {
  value: string
  display: string
  description?: string
}
