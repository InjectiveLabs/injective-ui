import { defineStore } from 'pinia'
import { Notification, NotificationType, NotificationOptions } from './../types'
import { DEFAULT_NOTIFICATION_TIMEOUT } from '../utils/constant/index'

type NotificationStoreState = {
  notifications: Notification[]
}

const initialStateFactory = (): NotificationStoreState => ({
  notifications: []
})

export const useSharedNotificationStore = defineStore('sharedNotification', {
  state: (): NotificationStoreState => initialStateFactory(),
  actions: {
    notify(options: NotificationOptions, type: NotificationType) {
      const notificationStore = useSharedNotificationStore()

      const notificationTitleAlreadyExist =
        notificationStore.notifications.some(
          (notification) =>
            notification.title.toLowerCase() === options.title.toLowerCase()
        )

      if (notificationTitleAlreadyExist) {
        return
      }

      notificationStore.$patch({
        notifications: [
          ...notificationStore.notifications,
          {
            type,
            id: Date.now(),
            title:
              options.title.charAt(0).toUpperCase() + options.title.slice(1),
            context: options.context,
            actions: options.actions,
            description: options.description,
            isTemplateString: options.isTemplateString,
            timeout: options.timeout || DEFAULT_NOTIFICATION_TIMEOUT
          }
        ]
      })
    },

    clear(id: number) {
      const notificationStore = useSharedNotificationStore()

      notificationStore.$patch({
        notifications: notificationStore.notifications.filter(
          (notification) => notification.id !== id
        )
      })
    },

    success(options: NotificationOptions) {
      const notificationStore = useSharedNotificationStore()

      notificationStore.notify(options, NotificationType.Success)
    },

    error(options: NotificationOptions) {
      const notificationStore = useSharedNotificationStore()

      notificationStore.notify(options, NotificationType.Error)
    },

    info(options: NotificationOptions) {
      const notificationStore = useSharedNotificationStore()

      notificationStore.notify(options, NotificationType.Info)
    },

    warning(options: NotificationOptions) {
      const notificationStore = useSharedNotificationStore()

      notificationStore.notify(options, NotificationType.Warning)
    }
  }
})
