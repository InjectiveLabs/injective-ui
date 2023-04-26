<script lang="ts" setup>
import { PropType, computed } from 'vue'
import { NotificationData, NotificationType } from './../../lib/types'
import Icon from './../components/Icon.vue'

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
          <Icon name="circle-info" class="w-6 h-6 min-w-6 text-blue-500" />
        </slot>
      </div>
      <div class="flex flex-col gap-2" :class="contentClass">
        <span class="text-sm font-semibold">{{ title }}</span>
        <span v-if="notification.description" class="text-sm">
          {{ notification.description }}
        </span>
      </div>
      <slot name="close" :close="close">
        <Icon name="close" class="w-3 h-3 min-w-3 text-white" @click="close" />
      </slot>
    </div>

    <div v-if="notification.actions" class="px-4 pb-4 pt-0 flex gap-2">
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

    <!-- <div v-if="showDeactivationTimer" class="w-full h-1 bg-gray-900">
      <div
        class="progress w-full h-full bg-blue-200 origin-top-right transform-gpu"
        :style="progressStyle"
      />
    </div> -->
  </div>
</template>
