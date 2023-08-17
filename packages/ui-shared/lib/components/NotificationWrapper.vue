<script lang="ts" setup>
import { PropType } from 'vue'
import { NotificationData } from '../types'
import useNotifications from '../composables/useNotifications'

const { pauseDeactivation, resumeDeactivation } = useNotifications()

const props = defineProps({
  notification: {
    type: Object as PropType<NotificationData>,
    required: true
  }
})

const onMouseEnter = () => {
  pauseDeactivation(props.notification.id)
}

const onMouseLeave = () => {
  resumeDeactivation(props.notification.id)
}
</script>

<template>
  <Transition
    enter-active-class="ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
      <slot />
    </div>
  </Transition>
</template>
