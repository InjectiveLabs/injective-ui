import {
  Coin,
  Message,
  EventLog,
  TokenType,
  TokenVerification,
  ContractTransaction,
  ExplorerTransaction,
  CW20BalanceExplorerApiResponse
} from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { MsgType } from '@injectivelabs/ts-types'
import { unknownToken } from '../../data/token'
import { msgTypeMap } from '../../data/explorer'
import { sharedCoinStringToCoins } from './../../utils/formatter'
import {
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

const getTypesAndCoins = (
  transaction: ExplorerTransaction | ContractTransaction
) => {
  const sender = transaction.signatures[0].address

  return {
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

export const toUiTransaction = (
  transaction: ExplorerTransaction
): UiExplorerTransaction => {
  return {
    ...transaction,
    ...getTypesAndCoins(transaction)
  }
}

export const toUiContractTransaction = (
  transaction: ContractTransaction
): UiContractTransaction => {
  return {
    ...transaction,
    hash: transaction.txHash,
    blockNumber: transaction.height,
    blockTimestamp: transaction.time,
    ...getTypesAndCoins(transaction)
  }
}
