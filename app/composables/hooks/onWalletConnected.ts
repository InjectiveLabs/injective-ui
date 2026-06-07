import { EventBus } from '../../types'
type WalletConnectedCallback = () => void | Promise<void>

function registerWalletConnectedCallback(callback: WalletConnectedCallback) {
  const sharedWalletStore = useSharedWalletStore()

  useEventBus(EventBus.WalletConnected).on(() => {
    if (!sharedWalletStore.isUserConnected) {
      return
    }

    return callback()
  })
}

// Runs on wallet connect only, not for an already connected wallet on mount.
export function onWalletConnectedOnly(callback: WalletConnectedCallback) {
  registerWalletConnectedCallback(callback)
}

// Runs on mount if the wallet is already connected, then on later wallet connects.
export function onWalletReady(
  onMountedCallback: WalletConnectedCallback,
  onConnectedCallback?: WalletConnectedCallback
) {
  const sharedWalletStore = useSharedWalletStore()

  onMounted(() => {
    if (!sharedWalletStore.isUserConnected) {
      return
    }

    return onMountedCallback()
  })

  registerWalletConnectedCallback(onConnectedCallback || onMountedCallback)
}

// Runs on every mount, then on later wallet connects.
export function onMountedOrWalletConnected(
  onMountedCallback: WalletConnectedCallback,
  onConnectedCallback?: WalletConnectedCallback
) {
  onMounted(onMountedCallback)
  registerWalletConnectedCallback(onConnectedCallback || onMountedCallback)
}

export const onWalletConnected = (callback: Function) => {
  onMounted(() => {
    callback()

    useEventBus(EventBus.WalletConnected).on(() => callback())
  })
}

export const onWalletInitialConnected = (callback: Function) => {
  useEventBus(EventBus.WalletConnected).on(() => callback())
}

export const onHasMagicAccount = (callback: Function) => {
  useEventBus(EventBus.HasMagicAccount).on(() => callback())
}
