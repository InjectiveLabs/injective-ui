# @InjectiveLabs/ui-notifications

Injective notification system

## Installation

Install the package. Any major starting with `1.x.x` is using the Vue Options API while versions starting with `2.x.x` are built for the Vue Compositions API.

```sh
$ yarn add @InjectiveLabs/ui-notifications --save
```

### Setup for Vue Composition API

1. Add the module to your `nuxt.config.js`

```javascript
export default defineNuxtConfig({
  modules: ['@injectivelabs/ui-notifications']
})
```

Your app is now ready to start using the Notification system.

### Setup for Vue Options API

1. Create a plugin in your `/plugins` folder. This is needed because Nuxt unfortunately does not allow us to specify an external package in our `nuxt.config.js` file directly.

```typescript
import NotificationPlugin from '@injectivelabs/ui-notifications'
import { Context } from '@nuxt/types'

export default (_: Context, inject: Function) => {
  const notifications = NotificationPlugin

  inject('notifications', notifications)
}
```

2. Add your newly created plugin to `nuxt.config.js`

```javascript
  plugins: [
    '~/plugins/notifications'
  }
```

Your app is now ready to start using the Notification system.

## TypeScript support for Options API (optional)

Add the following shims to `types/vue-shims.d.ts`:

```typescript
import { NotificationsPlugin } from '@injectivelabs/ui-notifications'

declare module '@nuxt/types' {
  interface Context {
    $notifications: NotificationsPlugin
  }
}

declare module '@nuxt/vue-app' {
  interface Context {
    $notifications: NotificationsPlugin
  }
}
```

Add `@injectivelabs/ui-notifications` to your `tsconfig.json` types array:

```json
"compilerOptions": {
  "types": [
    "@injectivelabs/ui-notifications"
  ]
}
```

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
          <!-- General data -->
          <span>{{ notification.id }}</span>
          <span>{{ notification.title }}</span>
          <span>{{ notification.description }}</span>

          <!-- Notification Types -->
          <ErrorIcon v-if="notification.type === NotificationType.Error" />
          <WarningIcon v-if="notification.type === NotificationType.Warning" />
          <InfoIcon v-if="notification.type === NotificationType.Info" />
          <SuccessIcon v-if="notification.type === NotificationType.Success" />

          <!-- Actions -->
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

### Options API

1. In your root component (or in individual layouts) add the `<Notifications>` component.

```vue
<template>
  <div>
    <YourApp />

    <Notifications />
  </div>
</template>

<script lang="ts">
import { Notifications } from '@injectivelabs/ui-notifications'

export default Vue.extend({
  components: {
    Notifications
  }
})
</script>
```

2. Create the markup for your notifications, or use the default `<Notification>` component provided by the package. Use the `#notification` scoped slot to get access to the notification data:

```vue
<template>
  <div>
    <YourApp />

    <Notifications>
      <template #notification="{ notification }">
        <!-- Use your own markup -->
        <div>
          <!-- General data -->
          <span>{{ notification.id }}</span>
          <span>{{ notification.title }}</span>
          <span>{{ notification.description }}</span>

          <!-- Notification Types -->
          <ErrorIcon v-if="notification.type === NotificationType.Error" />
          <WarningIcon v-if="notification.type === NotificationType.Warning" />
          <InfoIcon v-if="notification.type === NotificationType.Info" />
          <SuccessIcon v-if="notification.type === NotificationType.Success" />

          <!-- Actions -->
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

<script lang="ts">
import {
  Notifications,
  Notification,
  NotificationType
} from '@injectivelabs/ui-notifications'

export default Vue.extend({
  components: {
    Notifications,
    Notification
  },

  data() {
    return {
      NotificationType
    }
  }
})
</script>
```

3. From anywhere in your app use the `$notifications` global property to trigger notifications:

```vue
<script lang="ts">
export default Vue.extend({
  mounted() {
    this.fetchSomething()
      .then(() => {
        this.$notifications.success({
          title: 'Fetch successful!'
          description: 'Lorem ipsum' // Description is optional.
        })
      })
      .catch((err) => {
        this.$notifications.error({
          title: err.message,
          actions: [
            {
              key: 'copy', // Can be anything, just has to be unique to this notification.
              label: 'Copy error code',
              callback: ({ id, deactivate }) => { // notification id and a deactivate function have been passed as callback parameters.
                copyToClipboard(err)
                deactivate() // Not necessary but might be desirable in some cases.
              })
            }
          ]
        })
      })
  }
})
</script>
```

## Migrating from `$toast`

I've tried to keep the methods exposed by `$notifications` as similar as possible to `$toast` since most of our product seem to make use of it. This allows for easy refactoring, the only difference is that you'll have to pass an object instead of a string:

```js
this.$toast.success('It worked!')

// becomes

this.$notifications.success({
  title: 'It worked!'
})
```

In some of our projects we use `$onRejected`, `$onError` and `$onConfirm` which come from another plugin. Luckily we have access to the `$notifications` global property from within other Plugins as well:

```typescript
export default ({ app, $notifications }: Context, inject: any) => {
  const errorHandler = (error: ThrownException) => {
    $notifications.error({
      title: error.message
    })
  }

  inject('onError', errorHandler)
})
```

We can now call this.$onError from our components:

```vue

<script lang="ts">
export default Vue.extend({
  mounted() {
    this.fetchSomething()
      .then(() => {
        // Do something
      })
      .catch(this.$onError)
  }
})
```
