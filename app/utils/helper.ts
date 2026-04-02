import { toBigNumber } from '@injectivelabs/utils'
import {
  IS_MITO,
  IS_AUTHZ,
  IS_TRADING_UI,
  IS_TRUE_CURRENT,
  tradingMessages
} from './constant'
import { sharedTokenClient, tokenStaticFactory } from '../service'
import type { BigNumber } from '@injectivelabs/utils'
import type { Msgs, TokenStatic } from '@injectivelabs/sdk-ts'

export const sharedGetToken = async (
  denomOrSymbol: string
): Promise<undefined | TokenStatic> => {
  const token = tokenStaticFactory.toToken(denomOrSymbol)

  if (token) {
    return token
  }

  const asyncToken = await sharedTokenClient.queryToken(denomOrSymbol)

  return asyncToken
}

export const unAbbreviateNumber = (value: string): undefined | BigNumber => {
  const units = {
    K: Number(`1${'0'.repeat(3)}`),
    M: Number(`1${'0'.repeat(6)}`),
    B: Number(`1${'0'.repeat(9)}`),
    T: Number(`1${'0'.repeat(12)}`)
  } as Record<string, number>

  const unit = value.at(-1)

  if (!unit || !units[unit]) {
    return
  }

  const formattedValue = value.replaceAll(',', '').slice(0, -1)

  return toBigNumber(formattedValue).multipliedBy(units[unit])
}

export const abbreviateNumber = (number: number) => {
  const abbreviatedValue = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(number)

  const abbreviatedValueMatchesInput = toBigNumber(number).eq(
    unAbbreviateNumber(abbreviatedValue) || '0'
  )

  return abbreviatedValueMatchesInput
    ? abbreviatedValue
    : `≈${abbreviatedValue}`
}

export const checkUnauthorizedMessages = (msgs: Msgs[]) =>
  !msgs.every((msg) =>
    tradingMessages.includes(JSON.parse(msg.toJSON())['@type'])
  )

export const getBffProduct = (): any | undefined => {
  if (IS_TRUE_CURRENT) {
    return 'tc'
  }

  if (IS_TRADING_UI) {
    return 'tradingUi'
  }

  if (IS_MITO) {
    return 'vmWebsite'
  }

  if (IS_AUTHZ) {
    return 'doUi'
  }

  return process.env.VITE_PRODUCT || undefined
}
