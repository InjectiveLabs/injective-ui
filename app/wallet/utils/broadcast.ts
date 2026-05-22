import { tradingMessages } from '@/utils/constant'
import type { Msgs } from '@injectivelabs/sdk-ts'
import type { AutoSign } from '../../types'

export type PrepareBroadcastWalletState = {
  isUserConnected: boolean
  injectiveAddress: string
  isAutoSignEnabled: boolean
  isAuthzWalletConnected: boolean
}

export type AutoSignBroadcastWalletState = {
  isEip712: boolean
  autoSign?: AutoSign
  isAutoSignEnabled: boolean
}

export const checkUnauthorizedMessages = (msgs: Msgs[]) =>
  !msgs.every((msg) =>
    tradingMessages.includes(JSON.parse(msg.toJSON())['@type'])
  )

export function normalizeBroadcastMessages(messages: Msgs | Msgs[]) {
  return Array.isArray(messages) ? messages : [messages]
}
