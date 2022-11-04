<script lang="ts" setup>
import useNotifications from '../lib/composables/useNotifications'

const notifications = useNotifications()

function handleError() {
  notifications.error({
    title: 'Error title',
    description: 'Error description'
  })
}

function handleWarning() {
  notifications.warning({
    title: 'Warning title',
    description: 'Warning description'
  })
}

function handleSuccess() {
  notifications.success({
    title: 'Success title',
    description: 'Success description'
  })
}
</script>

<template>
  <div>
    <button
      class="h-8 px-4 bg-red-500 text-white font-semibold rounded"
      @click="handleError"
    >
      Error
    </button>
    <button
      class="h-8 px-4 bg-orange-400 text-white font-semibold rounded"
      @click="handleWarning"
    >
      Warning
    </button>
    <button
      class="h-8 px-4 bg-green-400 text-white font-semibold rounded"
      @click="handleSuccess"
    >
      Success
    </button>

    <Notifications
      class="z-1110 fixed inset-0 flex flex-col gap-2 justify-start items-end p-6 pointer-events-none"
      :notification-wrapper-class="'min-w-md'"
    >
      <template #notification="{ notification }">
        <Notification
          :notification="notification"
          class="pointer-events-auto bg-zinc-500"
        />
      </template>
    </Notifications>
  </div>
</template>
