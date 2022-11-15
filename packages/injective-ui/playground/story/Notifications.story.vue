<script lang="ts" setup>
const notifications = useNotifications()

function handleError() {
  notifications.error({
    title: 'Error title',
    description: 'Error description'
  })
}

function handleWarning() {
  notifications.warning({
    title: 'Warning title'
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
  <Story title="Notifications">
    <div class="h-screen">
      <div class="flex items-center justify-start gap-2">
        <button
          class="h-8 rounded bg-red-500 px-4 font-semibold text-white"
          @click="handleError"
        >
          Error
        </button>
        <button
          class="h-8 rounded bg-orange-400 px-4 font-semibold text-white"
          @click="handleWarning"
        >
          Warning
        </button>
        <button
          class="h-8 rounded bg-green-400 px-4 font-semibold text-white"
          @click="handleSuccess"
        >
          Success
        </button>
      </div>

      <!-- Hack to make sure tailwind classes are compiled and can be used in the <Notification> component -->
      <!-- Feel free to suggest alternatives -->
      <div class="text-red-500" />
      <div class="text-orange-400" />
      <div class="text-green-400" />

      <Notifications
        class="z-1110 pointer-events-none fixed inset-0 flex flex-col items-end justify-start gap-2 p-6"
      >
        <template #notification="{ notification }">
          <Notification
            :notification="notification"
            class="pointer-events-auto bg-gray-900"
          >
            <template #close="{ close }">
              <BaseIcon
                name="close-bold"
                class="min-w-4 h-4 w-4 text-white hover:text-blue-600"
                @click="close"
              />
            </template>
          </Notification>
        </template>
      </Notifications>
    </div>
  </Story>
</template>
