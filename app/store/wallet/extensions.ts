import { Wallet } from '@injectivelabs/wallet-base/light'
import { getEvmWalletProvider } from '../../wallet/utils/evm'

export const checkIsBitGetInstalled = async () => {
  const provider = await getEvmWalletProvider(Wallet.BitGet)

  return Boolean(provider)
}

export const checkIsKeplrEvmInstalled = async () => {
  const provider = await getEvmWalletProvider(Wallet.KeplrEvm)

  return Boolean(provider)
}

export const checkIsMetamaskInstalled = async () => {
  const provider = await getEvmWalletProvider(Wallet.Metamask)

  return Boolean(provider)
}

export const checkIsOkxWalletInstalled = async () => {
  const provider = await getEvmWalletProvider(Wallet.OkxWallet)

  return Boolean(provider)
}

export const checkIsPhantomWalletInstalled = async () => {
  const provider = await getEvmWalletProvider(Wallet.Phantom)

  return Boolean(provider)
}

export const checkIsRabbyWalletInstalled = async () => {
  const provider = await getEvmWalletProvider(Wallet.Rabby)

  return Boolean(provider)
}

export const checkIsTrustWalletInstalled = async () => {
  const provider = await getEvmWalletProvider(Wallet.TrustWallet)

  return Boolean(provider)
}

export const checkIsRainbowInstalled = async () => {
  const provider = await getEvmWalletProvider(Wallet.Rainbow)

  return Boolean(provider)
}

export const checkIsKeplrInstalled = async () => {
  const { isCosmosWalletInstalled } =
    await import('@injectivelabs/wallet-cosmos')

  return isCosmosWalletInstalled(Wallet.Keplr)
}

export const checkIsLeapInstalled = async () => {
  const { isCosmosWalletInstalled } =
    await import('@injectivelabs/wallet-cosmos')

  return isCosmosWalletInstalled(Wallet.Leap)
}

export const checkIsNinjiInstalled = async () => {
  const { isCosmosWalletInstalled } =
    await import('@injectivelabs/wallet-cosmos')

  return isCosmosWalletInstalled(Wallet.Ninji)
}

export const checkIsOwalletInstalled = async () => {
  const { isCosmosWalletInstalled } =
    await import('@injectivelabs/wallet-cosmos')

  return isCosmosWalletInstalled(Wallet.OWallet)
}
