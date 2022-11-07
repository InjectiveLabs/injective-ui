# @InjectiveLabs/ui-notifications

Injective notification system

## Installation

Install the package. Any major starting with `1.x.x` is using the Vue Options API while versions starting with `2.x.x` are built for the Vue Compositions API.

```sh
$ yarn add @InjectiveLabs/ui-notifications --save
```

### Setup

1. Add the module to your `nuxt.config.js`

```javascript
export default defineNuxtConfig({
  modules: ['@injectivelabs/ui-notifications']
})
```

Your app is now ready to start using the Notification system.

## Usage

### Composition API

1. In your root component (or in individual layouts) add the `<Notifications>` component.

```vue
<template>
  <div>
    <YourApp />

    <Notifications />
  </div>
</template>
x
```

2. Create the markup for your notifications, or use the default `<Notification>` component provided by the package. Use the `#notification` scoped slot to get access to the notification data:

```vue
<script lang="ts" setup>
import { NotificationType } from '@injectivelabs/ui-notifications'
</script>

<template>
  <div>
    <YourApp />

    <Notifications>
      <template #notification="{ notification }">
        <!-- Use your own markup -->
        <div>
          <span>{{ notification.id }}</span>
          <span>{{ notification.title }}</span>
          <span>{{ notification.description }}</span>

          <ErrorIcon v-if="notification.type === NotificationType.Error" />
          <WarningIcon v-if="notification.type === NotificationType.Warning" />
          <InfoIcon v-if="notification.type === NotificationType.Info" />
          <SuccessIcon v-if="notification.type === NotificationType.Success" />

          <div v-if="notification.actions">
            <button
              v-for="action in notification.actions"
              :key="action.key"
              @click="action.callback"
            >
              {{ action.label }}
            </button>
          </div>
        </div>

        <!-- Or use the default notification -->
        <Notification
          :notification="notification"
          class="pointer-events-auto"
        />
      </template>
    </Notifications>
  </div>
</template>
```

3. From any component use the `useNotifications` composable to get access to the notification system.

```vue
<script lang="ts" setup>
const { error, warning, success } = useNotifications()

const placeOrder = () => {
  fetch(...)
    .then(() => {
      success({
        title: 'Order placed',
        description: 'Your order has been submitted.'
      })
    })
    .catch(ex => {
      error({
        title: 'Oops',
        description: ex.message
      })
    })
}
</script>

<template>
  <div>
    <button @click="placeOrder">Place Order</button>
  </div>
</template>
```
