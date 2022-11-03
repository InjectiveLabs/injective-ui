<script lang="ts" setup>
import { PropType } from 'vue'
import { NotificationData } from '../types'

defineProps({
  notification: {
    type: Object as PropType<NotificationData>,
    required: true
  }
})
</script>

<template>
  <Transition
    enter-active-class="ease-out duration-300"
    enter-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="ease-in duration-200"
    leave-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
      <slot />
    </div>
  </Transition>
</template>

<script lang="ts">
// import { NotificationData } from '../types'

// export default Vue.extend({
//   props: {
//     notification: {
//       type: Object as PropType<NotificationData>,
//       required: true
//     }
//   },

//   data() {
//     return {
//       raf: undefined as number | undefined,
//       progress: 1 as number
//     }
//   },

//   computed: {
//     progressStyle(): string {
//       const { progress } = this

//       return `transform: scale3d(${progress}, 1, 1)`
//     }
//   },

//   watch: {
//     paused: {
//       handler: function (paused: boolean) {
//         const { notification } = this

//         if (!notification.showDeactivationTimer) {
//           return
//         }

//         if (paused) {
//           this.stopAnimating()
//           return
//         }

//         this.startAnimating()
//       },
//       immediate: true
//     }
//   },

//   created() {
//     const { notification } = this

//     if (!notification.showDeactivationTimer) {
//       return
//     }

//     this.startAnimating()
//   },

//   destroyed() {
//     const { notification } = this

//     if (!notification.showDeactivationTimer) {
//       return
//     }

//     this.stopAnimating()
//   },

//   methods: {
//     handleMouseEnter() {
//       const { notification } = this

//       this.$notifications.pauseDeactivation(notification.id)
//     },

//     handleMouseLeave() {
//       const { notification } = this

//       this.$notifications.resumeDeactivation(notification.id)
//     },

//     render() {
//       const { notification } = this

//       const delta = Date.now() - notification.timeoutStartedAt
//       const remainder = notification.timeoutRemainder - delta

//       this.progress = remainder / notification.timeoutDuration

//       this.raf = window.requestAnimationFrame(this.render)
//     },

//     startAnimating() {
//       const { raf } = this

//       if (raf !== undefined) {
//         return
//       }

//       this.raf = window.requestAnimationFrame(this.render)
//     },

//     stopAnimating() {
//       const { raf } = this

//       if (raf === undefined) {
//         return
//       }

//       window.cancelAnimationFrame(raf)
//       this.raf = undefined
//     }
//   }
// })
</script>
