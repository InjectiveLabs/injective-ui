import { NotificationsPlugin } from './lib/types'

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

declare module 'vue/types/vue' {
  interface VueConstructor {
    notifications: NotificationsPlugin
  }

  interface Vue {
    $notifications: NotificationsPlugin
  }
}
