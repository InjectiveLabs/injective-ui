<script lang="ts" setup>
import { PropType, computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import { NotificationData, NotificationType } from './../../lib/types'
import Icon from './../components/Icon.vue'
import HoverMenu from './../components/HoverMenu.vue'

const { copy } = useClipboard()

const props = defineProps({
  notification: {
    type: Object as PropType<NotificationData>,
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

const title = computed(
  (): string => props.notification.title || 'Notification Title'
)

function close() {
  props.notification.deactivate()
}
</script>

<template>
  <div class="rounded-lg pointer-events-auto" :class="wrapperClass">
    <div
      class="flex gap-2 justify-start items-start p-4"
      :class="{ 'items-center': !notification.description }"
    >
      <div v-if="notification.type === NotificationType.Error">
        <slot name="error">
          <Icon name="warn" class="w-6 h-6 min-w-6 text-red-500" />
        </slot>
      </div>
      <div v-if="notification.type === NotificationType.Warning">
        <slot name="warning">
          <Icon name="warn" class="w-6 h-6 min-w-6 text-orange-400" />
        </slot>
      </div>
      <div v-if="notification.type === NotificationType.Success">
        <slot name="success">
          <Icon
            name="circle-check-border"
            class="w-6 h-6 min-w-6 text-green-400"
          />
        </slot>
      </div>
      <div v-if="notification.type === NotificationType.Info">
        <slot name="info">
          <Icon name="circle-info" class="w-6 h-6 min-w-6 text-primary-500" />
        </slot>
      </div>
      <div class="flex flex-col gap-2" :class="contentClass">
        <span class="text-sm font-semibold">{{ title }}</span>

        <span
          v-if="notification.description"
          class="text-xs text-gray-400 flex items-center"
        >
          <span
            :class="{
              'mr-2': notification.tooltip
            }"
          >
            {{ notification.description }}
          </span>
          <HoverMenu
            v-if="notification.tooltip"
            popper-class="notification-tooltip"
            @click="copy(notification.tooltip)"
          >
            <template #default>
              <slot>
                <Icon name="circle-info" class="w-3 h-3" />
              </slot>
            </template>

            <template #content>
              {{ notification.tooltip }}
            </template>
          </HoverMenu>
        </span>

        <div v-if="notification.actions" class="flex justify-start">
          <button
            v-for="action in notification.actions"
            :key="action.key"
            @click="
              () =>
                action.callback({
                  id: notification.id,
                  deactivate: notification.deactivate
                })
            "
          >
            <span class="text-primary-500 text-sm font-semibold cursor-pointer">
              {{ action.label }}
            </span>
          </button>
        </div>
      </div>
      <slot name="close" :close="close">
        <Icon name="close" class="w-3 h-3 min-w-3 text-white" @click="close" />
      </slot>
    </div>

    <!-- <div v-if="showDeactivationTimer" class="w-full h-1 bg-gray-900">
      <div
        class="progress w-full h-full bg-blue-200 origin-top-right transform-gpu"
        :style="progressStyle"
      />
    </div> -->
  </div>
</template>

<style>
.notification-tooltip .v-popper__wrapper .v-popper__inner {
  @apply bg-gray-800 text-gray-300 border-none max-w-xs text-xs px-3 py-1 shadow-sm;
}

.notification-tooltip .v-popper__wrapper .v-popper__arrow-outer,
.notification-tooltip .v-popper__wrapper .v-popper__arrow-inner {
  @apply border-gray-800;
}
</style>
