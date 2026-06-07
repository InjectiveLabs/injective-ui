import { EventBus } from '../../types'
type WalletDisconnectedCallback = () => void | Promise<void>

function registerWalletDisconnectedCallback(
  callback: WalletDisconnectedCallback
) {
  const sharedWalletStore = useSharedWalletStore()

  useEventBus(EventBus.WalletDisconnected).on(() => {
    if (sharedWalletStore.isUserConnected) {
      return
    }

    return callback()
  })
}

// Runs on wallet disconnect only, not for an already disconnected wallet on mount.
export function onWalletDisconnectedOnly(callback: WalletDisconnectedCallback) {
  registerWalletDisconnectedCallback(callback)
}

// Runs on every mount, then on later wallet disconnects.
export function onMountedOrWalletDisconnected(
  onMountedCallback: WalletDisconnectedCallback,
  onDisconnectedCallback?: WalletDisconnectedCallback
) {
  onMounted(onMountedCallback)
  registerWalletDisconnectedCallback(
    onDisconnectedCallback || onMountedCallback
  )
}

export const onWalletDisconnected = (callback: Function) => {
  onMounted(() => {
    callback()

    useEventBus(EventBus.WalletDisconnected).on(() => callback())
  })
}
