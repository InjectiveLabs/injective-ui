import { Message } from '@injectivelabs/sdk-ts'

export const getHumanReadableMessage = (value: Message): string => {
  const { message, type } = value

  if (type === '/cosmos.bank.v1beta1.MsgSend') {
    const { amount, from_address: sender, to_address: receiver } = message
    const [coin] = amount as { denom: string; amount: string }[]

    return `{{account:${sender}}} sent {{denom:${coin.denom}-${coin.amount}}} to {{account:${receiver}}}`
  }

  return ''
}
