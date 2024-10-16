import { EventBus } from './../../types'

export const onWalletConnected = (callback: Function) => {
  onMounted(() => {
    callback()

    useEventBus(EventBus.WalletConnected).on(() => callback())
  })
}

export const onWalletInitialConnected = (callback: Function) => {
  useEventBus(EventBus.WalletConnected).on(() => callback())
}
