import { TokenStatic } from '@injectivelabs/sdk-ts'
import { tokenFactoryStatic, sharedTokenClient } from '../Service'

export const sharedGetToken = async (
  denomOrSymbol: string
): Promise<TokenStatic | undefined> => {
  const token = tokenFactoryStatic.toToken(denomOrSymbol)

  if (token) {
    return token
  }

  const asyncToken = await sharedTokenClient.queryToken(denomOrSymbol)

  return asyncToken
}
