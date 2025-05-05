import { sharedTokenClient, tokenStaticFactory } from '../Service'
import type { TokenStatic } from '@injectivelabs/sdk-ts'

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
