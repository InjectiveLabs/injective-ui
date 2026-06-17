import { NETWORK, ENDPOINTS } from '../utils/constant'
import type { MsgBroadcasterOptions } from '@injectivelabs/wallet-core'
import type { MsgBroadcasterWithPk } from '@injectivelabs/sdk-ts/core/tx'

let msgBroadcasterWithPkInstance: null | MsgBroadcasterWithPk = null
let msgBroadcasterWithPkPrivateKey: null | string = null

export const getMsgBroadcasterWithPk = (
  privateKey: string,
  options?: Partial<MsgBroadcasterOptions>
): Promise<MsgBroadcasterWithPk> => {
  if (
    msgBroadcasterWithPkInstance &&
    msgBroadcasterWithPkPrivateKey === privateKey
  ) {
    return Promise.resolve(msgBroadcasterWithPkInstance)
  }

  return import('@injectivelabs/sdk-ts/core/tx').then(
    ({ MsgBroadcasterWithPk }) => {
      msgBroadcasterWithPkInstance = new MsgBroadcasterWithPk({
        privateKey,
        network: NETWORK,
        endpoints: ENDPOINTS,
        ...options
      })
      msgBroadcasterWithPkPrivateKey = privateKey

      return msgBroadcasterWithPkInstance
    }
  )
}
