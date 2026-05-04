import { Wallet } from '@injectivelabs/wallet-base'
import { getWalletStrategy } from './../wallet/strategy'
import { IS_HELIX, IS_DEVNET, IS_MAINNET } from '../utils/constant'
import type { SharedWalletOption } from '../types'

export function useSharedWalletOptions() {
  const evmProviders = ref<Wallet[]>([])
  const sharedWalletStore = useSharedWalletStore()

  const popularOptions = computed(() => {
    return [
      {
        wallet: Wallet.Metamask,
        downloadLink:
          !sharedWalletStore.metamaskInstalled &&
          !evmProviders.value.includes(Wallet.Metamask)
            ? 'https://metamask.io/download'
            : undefined
      },
      {
        wallet: Wallet.Keplr,
        downloadLink:
          !sharedWalletStore.keplrInstalled &&
          !evmProviders.value.includes(Wallet.Keplr)
            ? 'https://www.keplr.app/download'
            : undefined
      },
      {
        wallet: Wallet.Rabby,
        downloadLink:
          !sharedWalletStore.rabbyInstalled &&
          !evmProviders.value.includes(Wallet.Rabby)
            ? 'https://rabby.io/'
            : undefined
      }
    ].filter((option) => option) as SharedWalletOption[]
  })

  const options = computed(
    () =>
      [
        {
          wallet: Wallet.Rainbow,
          downloadLink:
            !sharedWalletStore.rainbowInstalled &&
            !evmProviders.value.includes(Wallet.Rainbow)
              ? 'https://rainbow.me/download'
              : undefined
        },
        {
          wallet: Wallet.Leap,
          downloadLink: !sharedWalletStore.leapInstalled
            ? 'https://www.leapwallet.io/downloads'
            : undefined
        },
        IS_DEVNET
          ? undefined
          : {
              wallet: Wallet.BitGet,
              downloadLink:
                !sharedWalletStore.bitGetInstalled &&
                !evmProviders.value.includes(Wallet.BitGet)
                  ? 'https://web3.bitget.com/en/wallet-download'
                  : undefined
            },
        {
          wallet: Wallet.OkxWallet,
          downloadLink:
            !sharedWalletStore.okxWalletInstalled &&
            !evmProviders.value.includes(Wallet.OkxWallet)
              ? 'https://www.okx.com/web3'
              : undefined
        },
        { wallet: Wallet.Ledger },
        { wallet: Wallet.TrezorBip32 },
        // {
        //   wallet: Wallet.Cosmostation,
        //   downloadLink: !isCosmosStationWalletInstalled()
        //     ? 'https://www.cosmostation.io/wallet'
        //     : undefined
        // },
        {
          wallet: Wallet.Phantom,
          downloadLink: !sharedWalletStore.phantomInstalled
            ? 'https://phantom.com/download'
            : undefined
        },
        {
          wallet: Wallet.TrustWallet,
          downloadLink: !sharedWalletStore.trustWalletInstalled
            ? 'https://trustwallet.com/browser-extension/'
            : undefined
        },
        IS_MAINNET ? { wallet: Wallet.WalletConnect } : undefined,
        IS_HELIX ? { wallet: Wallet.Magic } : undefined
      ].filter((option) => option) as SharedWalletOption[]
  )

  async function validateWalletExtensionInstalled() {
    const walletStrategy = await getWalletStrategy()

    // Get EVM providers from the strategy to determine which wallet extensions are installed on client's browser
    const strategies = walletStrategy.strategies
    const evmStrategy =
      strategies[Wallet.Metamask] ||
      strategies[Wallet.Rabby] ||
      strategies[Wallet.Rainbow] ||
      strategies[Wallet.KeplrEvm] ||
      strategies[Wallet.OkxWallet]

    evmProviders.value = Object.keys(
      (evmStrategy as any)?.evmProviders || {}
    ) as Wallet[]

    await Promise.all([
      sharedWalletStore.checkIsBitGetInstalled(),
      sharedWalletStore.checkIsRainbowInstalled(),
      sharedWalletStore.checkIsMetamaskInstalled(),
      sharedWalletStore.checkIsKeplrEvmInstalled(),
      sharedWalletStore.checkIsOkxWalletInstalled(),
      sharedWalletStore.checkIsRabbyWalletInstalled(),
      sharedWalletStore.checkIsTrustWalletInstalled(),
      sharedWalletStore.checkIsPhantomWalletInstalled(),
      // Cosmos wallet checks
      sharedWalletStore.checkIsKeplrInstalled(),
      sharedWalletStore.checkIsLeapInstalled()
    ])
  }

  return {
    options,
    popularOptions,
    validateWalletExtensionInstalled
  }
}
