import { unknownToken } from '../../data/token'
import { msgTypeMap } from '../../data/explorer'
import { MsgType } from '@injectivelabs/ts-types'
import { toBigNumber } from '@injectivelabs/utils'
import { getHumanReadableMessage } from './messageSummary'
import { sharedCoinStringToCoins } from './../../utils/formatter'
import { TokenType, TokenVerification } from '@injectivelabs/sdk-ts/types'
import {
  contractMsgLabelMap,
  hardCodedContractCopyMap
} from './contractSummary'
import type { BigNumber } from '@injectivelabs/utils'
import type {
  Coin,
  Message,
  EventLogEvent,
  ContractTransaction,
  ExplorerTransaction,
  CW20BalanceExplorerApiResponse
} from '@injectivelabs/sdk-ts'
import type {
  UiContractTransaction,
  UiExplorerTransaction,
  SharedBalanceWithToken
} from '../../types'

export const toUiCw20Balance = (
  cw20Balance: CW20BalanceExplorerApiResponse
): SharedBalanceWithToken => {
  const denom = cw20Balance.contract_address
  const tokenInfo = cw20Balance.cw20_metadata?.token_info
  const marketingInfo = cw20Balance.cw20_metadata?.marketing_info

  return {
    denom,
    balance: cw20Balance.balance,
    token: {
      coinGeckoId: '',
      denom,
      address: denom,
      name: tokenInfo?.name || unknownToken.name,
      decimals: tokenInfo?.decimals || unknownToken.decimals,
      symbol: tokenInfo?.symbol || unknownToken.symbol,
      logo: marketingInfo?.logo || unknownToken.logo,
      tokenType: TokenType.Cw20,
      tokenVerification: TokenVerification.Unverified
    }
  }
}

const getMsgType = (msg: Message): MsgType => {
  const type = msg.type || (msg as unknown as { '@type': string })['@type']

  if (!type) return '' as MsgType

  if (type.startsWith('/')) {
    return type.split('/')[1] as MsgType
  }

  return type as MsgType
}

// get MsgExec sender address
// const getAuthzMsgSender = ({
//   events,
//   msgIndex,
//   authzMsgIndex
// }: {
//   msgIndex?: string
//   authzMsgIndex?: string
//   events: EventLogEvent[]
// }): string | undefined => {
//   if (!msgIndex || !authzMsgIndex) {
//     return
//   }

//   const authZMsgKeys = ['sender', 'authz_msg_index', 'msg_index']
//   const authZMsgEvents = events.filter(({ type }) => type === 'message')

//   if (!authZMsgEvents.length) {
//     return undefined
//   }

//   const authZSenderEvent = authZMsgEvents.find(({ attributes }) => {
//     const keys = attributes.map((attribute) => attribute.key)

//     if (keys.length !== authZMsgKeys.length) {
//       return false
//     }

//     const eventMatchesFormat = authZMsgKeys.every((key) => keys.includes(key))

//     if (!eventMatchesFormat) {
//       return false
//     }

//     const msgIndexAttribute = attributes.find(
//       ({ key, value }) => key === 'msg_index' && value === msgIndex
//     )
//     const authzMsgIndexAttribute = attributes.find(
//       ({ key, value }) => key === 'authz_msg_index' && value === authzMsgIndex
//     )

//     return msgIndexAttribute && authzMsgIndexAttribute
//   })

//   return authZSenderEvent?.attributes.find(({ key }) => key === 'sender')?.value
// }

export const getCoins = ({
  events,
  sender,
  eventType,
  attributeType
}: {
  sender: string
  eventType: string
  attributeType: string
  events?: EventLogEvent[]
}): Coin[] => {
  if (!events) {
    return []
  }

  const ownerCoinEvents = events.filter((log) => {
    if (log.type !== eventType) {
      return false
    }

    return log.attributes.some(
      ({ key, value }) => key === attributeType && value === sender
    )
  })

  const coinsDenomMap = ownerCoinEvents.reduce(
    (list, { attributes }) => {
      const amount = attributes.find(({ key }) => key === 'amount')?.value

      if (!amount) {
        return list
      }

      const coins = sharedCoinStringToCoins(amount)

      coins.forEach((coin) => {
        const listCoin = list[coin.denom]

        if (listCoin) {
          list[coin.denom] = listCoin.plus(coin.amount)

          return
        }

        list[coin.denom] = toBigNumber(coin.amount)
      })

      return list
    },
    {} as Record<string, BigNumber>
  )

  return Object.entries(coinsDenomMap).reduce((list, [denom, amount]) => {
    list = [
      ...list,
      {
        denom,
        amount: amount.toFixed()
      }
    ]

    return list
  }, [] as Coin[])
}

/**
 * Returns a human-readable suffix for a raw contract message (the inner object
 * that contains `contract`, `msg`, etc. for a MsgExecuteContractCompat).
 *
 * Detection priority:
 *   1. contractMsgLabelMap — both the contract address AND msg action must match.
 *      If the contract is known but the action does NOT match, return undefined
 *      (don't degrade to the copy-map fallback — e.g. cancel_intent_lane on the
 *      RFQ contract should not show "Execute Contract - RFQ").
 *   2. hardCodedContractCopyMap — contract address only, for contracts that have
 *      no msgLabel (any interaction shows the contract name).
 */
const getContractMsgSuffix = (
  contractMsg: Record<string, any>
): string | undefined => {
  const contract = contractMsg?.contract
  const msg = contractMsg?.msg

  const labelEntry = contractMsgLabelMap[contract]

  if (labelEntry) {
    return msg?.[labelEntry.msgAction] !== undefined
      ? labelEntry.label
      : undefined
  }

  return hardCodedContractCopyMap[contract]
}

const getMsgTypeSuffix = (message: Message): string | undefined => {
  const type = getMsgType(message)

  const abstractedMessage =
    type === MsgType.MsgExec ? message.message.msgs?.[0] : message.message

  if (!abstractedMessage) {
    return undefined
  }

  const abstractedType =
    type === MsgType.MsgExec ? getMsgType(abstractedMessage) : type

  if (
    abstractedType === MsgType.MsgExecuteContract ||
    abstractedType === MsgType.MsgExecuteContractCompat
  ) {
    return getContractMsgSuffix(abstractedMessage)
  }

  if (type === MsgType.MsgExec) {
    return msgTypeMap[abstractedType] || undefined
  }

  return undefined
}

const formatMsgType = (message: Message): string => {
  const type = getMsgType(message)
  const formattedType = msgTypeMap[type] || message.type

  const suffix = getMsgTypeSuffix(message)

  if (!suffix) {
    return formattedType
  }

  return `${formattedType} - ${suffix}`
}

const getSenderFromEvents = (events: EventLogEvent[]) => {
  return events
    .reduce(
      (list, event) => {
        return [...list, ...(event.attributes || [])]
      },
      [] as { key: string; value: string }[]
    )
    .find(({ key, value }) => key === 'sender' && value.startsWith('inj'))
    ?.value
}

/**
 * For MsgExec (authz), the tx signer is the grantee but coin events are
 * attributed to the granter (the inner message sender). Return that address
 * so getCoins can match the right events.
 */
const getMsgExecGranter = (messages: Message[]): string | undefined =>
  messages.find((m) => getMsgType(m) === MsgType.MsgExec)?.message?.msgs?.[0]
    ?.sender

const getTypesAndCoins = (
  transaction: ExplorerTransaction | ContractTransaction,
  messages: Message[]
) => {
  const events = (transaction.logs || []).flatMap(({ events }) => events)
  const sender =
    getMsgExecGranter(messages) ||
    transaction?.signatures?.[0]?.address ||
    (getSenderFromEvents(events) as string)

  try {
    return {
      types: messages.map(formatMsgType),
      coinReceived: getCoins({
        events,
        sender,
        attributeType: 'receiver',
        eventType: 'coin_received'
      }),
      coinSpent: getCoins({
        events,
        sender,
        attributeType: 'spender',
        eventType: 'coin_spent'
      })
    }
  } catch (error) {
    console.error('Error getting types and coins:', error, transaction)

    return {
      types: [],
      coinReceived: [],
      coinSpent: []
    }
  }
}

const parseJsonString = (value: any): any => {
  if (!value || typeof value !== 'string') {
    return value
  }

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

const parseTransactionMessage = (message: Message): Message => {
  const raw = message.message as any

  if (!raw) {
    return message
  }

  return {
    ...message,
    message: {
      ...raw,
      ...(raw.msg !== undefined && { msg: parseJsonString(raw.msg) }),
      ...(Array.isArray(raw.msgs) && {
        msgs: raw.msgs.map((msgItem: any) => {
          if (
            typeof msgItem === 'object' &&
            msgItem !== null &&
            'msg' in msgItem
          ) {
            return { ...msgItem, msg: parseJsonString(msgItem.msg) }
          }

          return msgItem
        })
      })
    }
  }
}

export const toUiTransaction = (
  transaction: ExplorerTransaction,
  injectiveAddress?: string
): UiExplorerTransaction => {
  const messages = transaction.messages.map(parseTransactionMessage)

  return {
    ...transaction,
    ...getTypesAndCoins(transaction, messages),
    messages,
    templateSummaries: messages.map((message) => ({
      type: message.type,
      summary: getHumanReadableMessage({
        value: message,
        injectiveAddress,
        logs: transaction.logs || []
      })
    }))
  }
}

export const toUiContractTransaction = (
  transaction: ContractTransaction
): UiContractTransaction => {
  const messages = transaction.messages.map(parseTransactionMessage)

  return {
    ...transaction,
    hash: transaction.txHash,
    blockNumber: transaction.height,
    blockTimestamp: transaction.time,
    messages,
    ...getTypesAndCoins(transaction, messages),
    templateSummaries: messages.map((message) => ({
      type: message.type,
      summary: getHumanReadableMessage({
        value: message,
        logs: transaction.logs || []
      })
    }))
  }
}
