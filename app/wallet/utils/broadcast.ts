import { tradingMessages } from '../../utils/constant'
import type { Msgs } from '@injectivelabs/sdk-ts'

export const checkUnauthorizedMessages = (msgs: Msgs[]) =>
  !msgs.every((msg) =>
    tradingMessages.includes(JSON.parse(msg.toJSON())['@type'])
  )

export function normalizeBroadcastMessages(messages: Msgs | Msgs[]) {
  return Array.isArray(messages) ? messages : [messages]
}
