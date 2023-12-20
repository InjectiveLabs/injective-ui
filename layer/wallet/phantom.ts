import { UtilsWallets } from '@injectivelabs/wallet-ts'

export const isPhantomInstalled = async (): Promise<boolean> => {
  const provider = await UtilsWallets.getPhantomProvider()

  return !!provider
}
