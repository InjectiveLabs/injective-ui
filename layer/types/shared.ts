import { NotificationType } from './enum'

export interface NotificationAction {
  key: string
  label: string
  callback: Function
}

export interface Notification {
  id: number
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

export interface JsonValidator {
  moniker: string
  identity: string
  operatorAddress: string
  image: string
}
