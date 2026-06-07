import { EventBus } from '../../types'
import type { TxResponse } from '@injectivelabs/sdk-ts'

export const onBroadcastResponse = (callback: (response: TxResponse) => void) => {
  useEventBus(EventBus.BroadcastResponse).on((response) => callback(response as TxResponse))
}
