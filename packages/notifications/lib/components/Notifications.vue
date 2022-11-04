<script lang="ts" setup>
// import useNotifications from '../composables/useNotifications'
import useNotifications from '../composables/useNotifications'

const notifications = useNotifications()

defineProps({
  notificationWrapperClass: {
    type: String,
    default: ''
  }
})

function deactivate(id: number) {
  notifications.deactivate(id)
}
</script>

<template>
  <div>
    <NotificationWrapper
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
    </NotificationWrapper>
  </div>
</template>
