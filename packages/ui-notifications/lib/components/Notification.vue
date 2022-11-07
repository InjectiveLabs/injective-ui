<script lang="ts" setup>
import { PropType, computed } from 'vue'

import { NotificationData, NotificationType } from '../types'

const props = defineProps({
  notification: {
    type: Object as PropType<NotificationData>,
    required: true
  }
})

const title = computed(
  (): string => props.notification.title || 'Notification Title'
)
</script>

<template>
  <div class="bg-gray-800 rounded-lg pointer-events-auto">
    <div class="flex gap-2 justify-start items-start p-4">
      <div
        v-if="notification.type === NotificationType.Error"
        class="w-6 h-6 text-red-500"
      >
        <IconsError />
      </div>
      <div
        v-if="notification.type === NotificationType.Warning"
        class="w-6 h-6 text-orange-400"
      >
        <IconsWarning />
      </div>
      <div
        v-if="notification.type === NotificationType.Success"
        class="w-6 h-6 text-green-400"
      >
        <IconsSuccess />
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-sm text-white font-semibold">{{ title }}</span>
        <span v-if="notification.description" class="text-sm text-white">
          {{ notification.description }}
        </span>
      </div>
      <div
        class="w-3 h-3 text-white ml-auto cursor-pointer"
        @click="notification.deactivate"
      >
        <IconsClose />
      </div>
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
