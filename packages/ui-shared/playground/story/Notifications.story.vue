<script lang="ts" setup>
const notifications = useNotifications()

function handleError() {
  notifications.error({
    timeout: 6 * 1000,
    title: 'Error title',
    description: 'Error description'
  })
}

function handleWarning() {
  notifications.warning({
    timeout: 6 * 1000,
    title: 'Warning title'
  })
}

function handleSuccess() {
  notifications.success({
    timeout: 6 * 1000,
    title: 'Success title',
    description: 'Success description'
  })
}
</script>

<template>
  <Story title="Notifications">
    <div class="h-screen w-screen">
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

      <BaseNotifications
        class="z-[1110] pointer-events-none fixed inset-0 flex flex-col items-end justify-start gap-2 p-6"
      >
        <template #notification="{ notification }">
          <BaseNotification
            :notification="notification"
            class="pointer-events-auto"
            wrapper-class="bg-gray-900 shadow-glow-lg"
            content-class="text-white"
          >
            <template #close="{ close }">
              <BaseIcon
                name="close-bold"
                class="min-w-4 h-4 w-4 text-white hover:text-blue-600"
                @click="close"
              />
            </template>
          </BaseNotification>
        </template>
      </BaseNotifications>
    </div>
  </Story>
</template>
