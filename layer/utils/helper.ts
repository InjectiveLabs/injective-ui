import { TokenStatic } from '@injectivelabs/sdk-ts'
import { tokenStaticFactory, sharedTokenClient } from '../Service'

export const sharedGetToken = async (
  denomOrSymbol: string
): Promise<TokenStatic | undefined> => {
  const token = tokenStaticFactory.toToken(denomOrSymbol)

  if (token) {
    return token
  }

  const asyncToken = await sharedTokenClient.queryToken(denomOrSymbol)

  return asyncToken
}
