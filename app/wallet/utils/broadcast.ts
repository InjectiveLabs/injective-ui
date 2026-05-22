import { tradingMessages } from '@/utils/constant'
import { GeneralException } from '@injectivelabs/exceptions'
import { msgsOrMsgExecMsgs } from '@injectivelabs/sdk-ts/core/modules'
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

export function prepareBroadcastOptions({
  messages,
  memo,
  walletState
}: {
  memo?: string
  messages: Msgs | Msgs[]
  walletState: {
    isUserConnected: boolean
    injectiveAddress: string
    isAutoSignEnabled: boolean
    isAuthzWalletConnected: boolean
    authZOrInjectiveAddress: string
  }
}) {
  if (!walletState.isUserConnected) {
    return
  }

  if (walletState.isAutoSignEnabled && walletState.isAuthzWalletConnected) {
    throw new GeneralException(
      new Error('Authz and auto-sign cannot be used together')
    )
  }

  const normalizedMessages = normalizeBroadcastMessages(messages)
  const actualMessages = walletState.isAuthzWalletConnected
    ? msgsOrMsgExecMsgs(normalizedMessages, walletState.injectiveAddress)
    : normalizedMessages

  return {
    memo,
    msgs: actualMessages,
    injectiveAddress: walletState.isAuthzWalletConnected
      ? walletState.authZOrInjectiveAddress
      : walletState.injectiveAddress
  }
}
