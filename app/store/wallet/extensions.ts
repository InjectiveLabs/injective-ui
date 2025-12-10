import { Wallet } from '@injectivelabs/wallet-base'
import { getEvmWalletProvider } from '@shared/wallet'

export const checkIsBitGetInstalled = async () => {
  const walletStore = useSharedWalletStore()

  const provider = await getEvmWalletProvider(Wallet.BitGet)

  walletStore.$patch({
    bitGetInstalled: provider && Object.keys(provider).length > 0
  })
}

export const checkIsMetamaskInstalled = async () => {
  const walletStore = useSharedWalletStore()

  const provider = await getEvmWalletProvider(Wallet.Metamask)

  walletStore.$patch({
    metamaskInstalled: provider && Object.keys(provider).length > 0
  })
}

export const checkIsOkxWalletInstalled = async () => {
  const walletStore = useSharedWalletStore()

  const provider = await getEvmWalletProvider(Wallet.OkxWallet)

  walletStore.$patch({
    okxWalletInstalled: provider && Object.keys(provider).length > 0
  })
}

export const checkIsPhantomWalletInstalled = async () => {
  const walletStore = useSharedWalletStore()

  const provider = await getEvmWalletProvider(Wallet.Phantom)

  walletStore.$patch({
    phantomInstalled: provider && Object.keys(provider).length > 0
  })
}

export const checkIsRabbyWalletInstalled = async () => {
  const walletStore = useSharedWalletStore()

  const provider = await getEvmWalletProvider(Wallet.Rabby)

  walletStore.$patch({
    rabbyInstalled: provider && Object.keys(provider).length > 0
  })
}

export const checkIsTrustWalletInstalled = async () => {
  const walletStore = useSharedWalletStore()

  const provider = await getEvmWalletProvider(Wallet.TrustWallet)

  walletStore.$patch({
    trustWalletInstalled: provider && Object.keys(provider).length > 0
  })
}

export const checkIsRainbowInstalled = async () => {
  const walletStore = useSharedWalletStore()

  const provider = await getEvmWalletProvider(Wallet.Rainbow)

  walletStore.$patch({
    rainbowInstalled: provider && Object.keys(provider).length > 0
  })
}

// Cosmos wallet extension checks
export const checkIsKeplrInstalled = async () => {
  const walletStore = useSharedWalletStore()
  const { isCosmosWalletInstalled } =
    await import('@injectivelabs/wallet-cosmos')

  walletStore.$patch({
    keplrInstalled: isCosmosWalletInstalled(Wallet.Keplr)
  })
}

export const checkIsLeapInstalled = async () => {
  const walletStore = useSharedWalletStore()
  const { isCosmosWalletInstalled } =
    await import('@injectivelabs/wallet-cosmos')

  walletStore.$patch({
    leapInstalled: isCosmosWalletInstalled(Wallet.Leap)
  })
}

export const checkIsNinjiInstalled = async () => {
  const walletStore = useSharedWalletStore()
  const { isCosmosWalletInstalled } =
    await import('@injectivelabs/wallet-cosmos')

  walletStore.$patch({
    ninjiInstalled: isCosmosWalletInstalled(Wallet.Ninji)
  })
}

export const checkIsOwalletInstalled = async () => {
  const walletStore = useSharedWalletStore()
  const { isCosmosWalletInstalled } =
    await import('@injectivelabs/wallet-cosmos')

  walletStore.$patch({
    owalletInstalled: isCosmosWalletInstalled(Wallet.OWallet)
  })
}
