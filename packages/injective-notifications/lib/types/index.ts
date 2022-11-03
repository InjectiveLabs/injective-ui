export interface NotificationAction {
  key: string
  label: string
  // eslint-disable-next-line @typescript-eslint/ban-types
  callback: Function
}

export enum NotificationType {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Success = 'success'
}

export interface NotificationData {
  id: number
  type: NotificationType
  title: string
  description: string
  createdAt: number
  timeout: any
  timeoutStartedAt: number
  timeoutRemainder: number
  timeoutDuration: number
  paused: boolean
  showDeactivationTimer: boolean
  actions: NotificationAction[] | undefined
  // eslint-disable-next-line @typescript-eslint/ban-types
  deactivate: Function
}

export interface NotificationOptions {
  /**
   * Title of the notification
   */
  title: string

  /**
   * Description of the notification
   */
  description?: string

  /**
   * Display time of the notification in millisecond
   */
  timeout?: number

  /**
   * Actions the user can trigger from within the notification
   */
  actions?: NotificationAction[]
}

export interface NotificationState {
  notifications: Array<NotificationData>
  idCounter: number
}

export interface NotificationsPlugin {
  /**
   * Notification state object.
   */
  state: NotificationState

  /**
   * Triggers a notification of type NotificationType.Error
   * @param options
   */
  error(options: NotificationOptions): void

  /**
   * Triggers a notification of type NotificationType.Warning
   * @param options
   */
  warning(options: NotificationOptions): void

  /**
   * Triggers a notification of type NotificationType.Info
   * @param options
   */
  info(options: NotificationOptions): void

  /**
   * Triggers a notification of type NotificationType.Success
   * @param options
   */
  success(options: NotificationOptions): void

  /**
   * Deactivates a notification using the given id
   * @param id
   */
  deactivate(id: number): void

  /**
   * Pauses the deactivation timer for a notification using the given id
   * @param id
   */
  pauseDeactivation(id: number): void

  /**
   * Resumes the deactivation timer for a notification using the given id
   * @param id
   */
  resumeDeactivation(id: number): void

  /**
   * Clears all notifications
   */
  clear(): void
}
