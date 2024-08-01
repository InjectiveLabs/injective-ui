<script lang="ts" setup>
import { PropType } from 'vue'
import { Notification, NotificationType } from './../types'

const notificationStore = useSharedNotificationStore()
const { copy } = useClipboard()

const props = defineProps({
  notification: {
    type: Object as PropType<Notification>,
    required: true
  },

  wrapperClass: {
    type: String,
    default: 'bg-gray-800'
  },

  contentClass: {
    type: String,
    default: 'text-white'
  }
})

const timeout = ref()
const remainingTimeout = ref(6000)

onMounted(
  () => (timeout.value = setTimeout(onClose, props.notification.timeout))
)

function onCopy() {
  copy(props.notification.context)
}

function onClose() {
  notificationStore.clear(props.notification.id)
  clearTimeout(timeout.value)
}

function onPause() {
  clearTimeout(timeout.value)
  remainingTimeout.value -= Date.now() - props.notification.id
}

function onResume() {
  timeout.value = setTimeout(onClose, remainingTimeout.value)
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
    <div
      class="rounded-lg pointer-events-auto ui-notification"
      :class="wrapperClass"
      @mouseenter="onPause"
      @mouseleave="onResume"
    >
      <div
        class="flex gap-2 justify-start items-start p-4"
        :class="{ 'items-center': !notification.description }"
      >
        <div v-if="notification.type === NotificationType.Error">
          <slot name="error">
            <SharedIcon name="warn" class="text-red-500" />
          </slot>
        </div>
        <div v-if="notification.type === NotificationType.Warning">
          <slot name="warning">
            <SharedIcon name="warn" class="text-orange-400" />
          </slot>
        </div>
        <div v-if="notification.type === NotificationType.Success">
          <slot name="success">
            <SharedIcon name="circle-check-border" class="text-green-400" />
          </slot>
        </div>
        <div v-if="notification.type === NotificationType.Info">
          <slot name="info">
            <SharedIcon name="circle-info" class="text-primary-500" />
          </slot>
        </div>
        <div class="flex flex-col gap-2" :class="contentClass">
          <span class="text-sm font-semibold">{{ notification.title }}</span>

          <span
            v-if="notification.description"
            class="text-xs text-gray-400 flex items-center ui-notification-description"
          >
            {{ notification.description }}
          </span>

          <span
            v-if="notification.context"
            class="text-xs text-gray-400 flex items-center ui-notification-context"
          >
            <SharedHoverMenu
              v-if="notification.context"
              popper-class="notification-context"
              @click="onCopy"
            >
              <template #default>
                <slot>
                  <span
                    class="text-xs text-gray-400 flex items-center ui-notification-context"
                  >
                    Show more context
                  </span>
                </slot>
              </template>

              <template #content>
                {{ notification.context }}
              </template>
            </SharedHoverMenu>
          </span>

          <div v-if="notification.actions" class="flex justify-start">
            <button
              v-for="action in notification.actions"
              :key="action.key"
              @click="() => action.callback()"
            >
              <span
                class="text-primary-500 text-sm font-semibold cursor-pointer"
              >
                {{ action.label }}
              </span>
            </button>
          </div>
        </div>
        <slot name="close" :close-notification="onClose">
          <SharedIcon name="close" is-sm class="text-white" @click="onClose" />
        </slot>
      </div>

      <!-- <div v-if="showDeactivationTimer" class="w-full h-1 bg-gray-900">
      <div
        class="progress w-full h-full bg-blue-200 origin-top-right transform-gpu"
        :style="progressStyle"
      />
    </div> -->
    </div>
  </Transition>
</template>

<style>
.notification-context .v-popper__wrapper .v-popper__inner {
  @apply bg-gray-800 text-gray-300 border-none max-w-xs text-xs px-3 py-1 shadow-sm;
}

.notification-context .v-popper__wrapper .v-popper__arrow-outer,
.notification-context .v-popper__wrapper .v-popper__arrow-inner {
  @apply border-gray-800;
}
</style>
