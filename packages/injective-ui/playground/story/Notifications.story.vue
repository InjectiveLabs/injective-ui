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
      <div class="flex justify-start items-center gap-2">
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
      </div>

      <!-- Hack to make sure tailwind classes are compiled and can be used in the <Notification> component -->
      <!-- Feel free to suggest alternatives -->
      <div class="text-red-500" />
      <div class="text-orange-400" />
      <div class="text-green-400" />

      <Notifications
        class="z-1110 fixed inset-0 flex flex-col gap-2 justify-start items-end p-6 pointer-events-none"
      >
        <template #notification="{ notification }">
          <Notification
            :notification="notification"
            class="pointer-events-auto bg-gray-900"
          >
            <template #close="{ close }">
              <BaseIcon
                name="close-bold"
                class="min-w-4 w-4 h-4 text-white hover:text-blue-600"
                @click="close"
              />
            </template>
          </Notification>
        </template>
      </Notifications>
    </div>
  </Story>
</template>
