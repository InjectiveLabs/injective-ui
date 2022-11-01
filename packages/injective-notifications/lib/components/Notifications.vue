<script lang="ts" setup>
import { useNotifications } from '../../src/plugin'
// import { NotificationData } from '../types'

const notifications = useNotifications()

defineProps({
  notificationWrapperClass: {
    type: String,
    default: ''
  }
  // notifications: {
  //   type: Array as PropType<NotificationData[]>,
  //   required: true
  // }
})

function deactivate(id: number) {
  notifications.deactivate(id)
}
</script>

<template>
  <div>
    <BaseNotificationWrapper
      v-for="notification in notifications.state.notifications"
      :key="notification.id"
      :class="notificationWrapperClass"
      :notification="notification"
    >
      <slot
        name="notification"
        :notification="{
          ...notification,
          deactivate: () => deactivate(notification.id)
        }"
      />
    </BaseNotificationWrapper>
  </div>
</template>

<script lang="ts">
// import Vue, { PropType } from 'vue'

// import NotificationWrapper from './notification-wrapper.vue'

// import { NotificationData } from '../types'

// export default Vue.extend({
//   components: {
//     NotificationWrapper
//   },

//   props: {
//     notificationWrapperClass: {
//       type: String,
//       default: ''
//     },

//     notifications: {
//       type: Array as PropType<NotificationData[]>,
//       required: true
//     }
//   },

//   // computed: {
//   //   notifications(): NotificationData[] {
//   //     return this.$notifications.state.notifications
//   //   }
//   // },

//   methods: {
//     deactivate(id: number) {
//       this.$notifications.deactivate(id)
//     }
//   }
// })
</script>
