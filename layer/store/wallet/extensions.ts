import { Wallet } from '@injectivelabs/wallet-base'
import { getEvmWalletProvider } from '../../WalletService'

export const checkIsBitGetInstalled = async () => {
  const walletStore = useSharedWalletStore()

  walletStore.$patch({
    bitGetInstalled: await !!getEvmWalletProvider(Wallet.BitGet)
  })
}

export const checkIsMetamaskInstalled = async () => {
  const walletStore = useSharedWalletStore()

  walletStore.$patch({
    metamaskInstalled: await !!getEvmWalletProvider(Wallet.Metamask)
  })
}

export const checkIsOkxWalletInstalled = async () => {
  const walletStore = useSharedWalletStore()

  walletStore.$patch({
    okxWalletInstalled: await !!getEvmWalletProvider(Wallet.OkxWallet)
  })
}

export const checkIsPhantomWalletInstalled = async () => {
  const walletStore = useSharedWalletStore()

  walletStore.$patch({
    phantomInstalled: await !!getEvmWalletProvider(Wallet.Phantom)
  })
}

export const checkIsRabbyWalletInstalled = async () => {
  const walletStore = useSharedWalletStore()

  walletStore.$patch({
    rabbyInstalled: await !!getEvmWalletProvider(Wallet.Rabby)
  })
}

export const checkIsTrustWalletInstalled = async () => {
  const walletStore = useSharedWalletStore()

  walletStore.$patch({
    trustWalletInstalled: await !!getEvmWalletProvider(Wallet.TrustWallet)
  })
}

export const checkIsRainbowInstalled = async () => {
  const walletStore = useSharedWalletStore()

  walletStore.$patch({
    rainbowInstalled: await !!getEvmWalletProvider(Wallet.Rainbow)
  })
}
