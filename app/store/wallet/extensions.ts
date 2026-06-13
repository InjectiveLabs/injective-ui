import { Wallet } from '../../types'

async function getEvmWalletProvider(wallet: Wallet) {
  const walletModule = await import('@shared/wallet')

  return walletModule.getEvmWalletProvider(wallet)
}

export const checkIsBitGetInstalled = async () => {
  const walletStore = useSharedWalletStore()

  const provider = await getEvmWalletProvider(Wallet.BitGet)

  walletStore.$patch({
    bitGetInstalled: Boolean(provider)
  })
}

export const checkIsKeplrEvmInstalled = async () => {
  const walletStore = useSharedWalletStore()

  const provider = await getEvmWalletProvider(Wallet.KeplrEvm)

  walletStore.$patch({
    keplrEvmInstalled: Boolean(provider)
  })
}

export const checkIsMetamaskInstalled = async () => {
  const walletStore = useSharedWalletStore()

  const provider = await getEvmWalletProvider(Wallet.Metamask)

  walletStore.$patch({
    metamaskInstalled: Boolean(provider)
  })
}

export const checkIsOkxWalletInstalled = async () => {
  const walletStore = useSharedWalletStore()

  const provider = await getEvmWalletProvider(Wallet.OkxWallet)

  walletStore.$patch({
    okxWalletInstalled: Boolean(provider)
  })
}

export const checkIsPhantomWalletInstalled = async () => {
  const walletStore = useSharedWalletStore()

  const provider = await getEvmWalletProvider(Wallet.Phantom)

  walletStore.$patch({
    phantomInstalled: Boolean(provider)
  })
}

export const checkIsRabbyWalletInstalled = async () => {
  const walletStore = useSharedWalletStore()

  const provider = await getEvmWalletProvider(Wallet.Rabby)

  walletStore.$patch({
    rabbyInstalled: Boolean(provider)
  })
}

export const checkIsTrustWalletInstalled = async () => {
  const walletStore = useSharedWalletStore()

  const provider = await getEvmWalletProvider(Wallet.TrustWallet)

  walletStore.$patch({
    trustWalletInstalled: Boolean(provider)
  })
}

export const checkIsRainbowInstalled = async () => {
  const walletStore = useSharedWalletStore()

  const provider = await getEvmWalletProvider(Wallet.Rainbow)

  walletStore.$patch({
    rainbowInstalled: Boolean(provider)
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
