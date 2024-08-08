import {
  Coin,
  Message,
  EventLog,
  TokenType,
  TokenVerification,
  ExplorerTransaction,
  CW20BalanceExplorerApiResponse
} from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MsgType } from '@injectivelabs/ts-types'
import { unknownToken } from '../../data/token'
import { msgTypeMap } from '../../data/explorer'
import { sharedCoinStringToCoins } from './../../utils/formatter'
import { UiExplorerTransaction, SharedBalanceWithToken } from '../../types'

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
      tokenVerification: TokenVerification.Internal
    }
  }
}

const getMsgType = (msg: Message): MsgType => {
  const type = msg.type

  if (type.startsWith('/')) {
    return type.split('/')[1] as MsgType
  }

  return type as MsgType
}

export const getCoins = ({
  logs,
  sender,
  eventType,
  attributeType
}: {
  sender: string
  logs?: EventLog[]
  attributeType: string
  eventType: string
}): Coin[] => {
  if (!logs) {
    return []
  }

  const { events } = logs[0]

  if (!events) {
    return []
  }

  const ownerCoinEvents = events.filter(
    (log) =>
      log.type === eventType &&
      log.attributes.some(
        ({ key, value }) => key === attributeType && value === sender
      )
  )

  const coinsDenomMap = ownerCoinEvents.reduce(
    (list, { attributes }) => {
      const amount = attributes.find(({ key }) => key === 'amount')?.value

      if (!amount) {
        return list
      }

      const coins = sharedCoinStringToCoins(amount)

      coins.forEach((coin) => {
        if (list[coin.denom]) {
          list[coin.denom] = list[coin.denom].plus(coin.amount)

          return
        }

        list[coin.denom] = new BigNumberInBase(coin.amount)
      })

      return list
    },
    {} as Record<string, BigNumberInBase>
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

// todo remove once /api/explorer/v1/txs?skip=0&limit=20 add signatures
const getSender = (transaction: ExplorerTransaction): string => {
  if (transaction.signatures) {
    return transaction.signatures[0].address
  }

  const message = transaction.messages[0]?.message
  const msgs = message.msgs

  if (msgs) {
    return msgs[0].sender
  }

  if (message.from_address) {
    return message.from_address
  }

  return message.sender
}

export const toUiTransaction = (
  transaction: ExplorerTransaction
): UiExplorerTransaction => {
  const sender = getSender(transaction)

  return {
    ...transaction,
    types: transaction.messages.map(
      (message) => msgTypeMap[getMsgType(message)] || message.type
    ),
    coinReceived: getCoins({
      sender,
      logs: transaction.logs,
      attributeType: 'receiver',
      eventType: 'coin_received'
    }),
    coinSpent: getCoins({
      sender,
      logs: transaction.logs,
      attributeType: 'spender',
      eventType: 'coin_spent'
    })
  }
}
