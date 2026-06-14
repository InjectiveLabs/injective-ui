import { Wallet } from '@injectivelabs/wallet-base/light'
import {
  IS_HELIX,
  IS_DEVNET,
  IS_MAINNET,
  IS_TRUE_CURRENT
} from '../utils/constant'
import type { SharedWalletOption } from '../types'

export function useSharedWalletOptions() {
  const sharedWalletStore = useSharedWalletStore()

  const popularOptions = computed(() => {
    return [
      {
        wallet: Wallet.Metamask,
        downloadLink:
          !sharedWalletStore.metamaskInstalled
            ? 'https://metamask.io/download'
            : undefined
      },
      {
        wallet: Wallet.Keplr,
        downloadLink:
          !sharedWalletStore.keplrInstalled
            ? 'https://www.keplr.app/download'
            : undefined
      },
      {
        wallet: Wallet.Rabby,
        downloadLink:
          !sharedWalletStore.rabbyInstalled
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
            !sharedWalletStore.rainbowInstalled
              ? 'https://rainbow.me/download'
              : undefined
        },
        IS_TRUE_CURRENT
          ? undefined
          : {
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
                !sharedWalletStore.bitGetInstalled
                  ? 'https://web3.bitget.com/en/wallet-download'
                  : undefined
            },
        {
          wallet: Wallet.OkxWallet,
          downloadLink:
            !sharedWalletStore.okxWalletInstalled
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
        IS_MAINNET && !IS_TRUE_CURRENT
          ? { wallet: Wallet.WalletConnect }
          : undefined,
        IS_HELIX ? { wallet: Wallet.Magic } : undefined
      ].filter((option) => option) as SharedWalletOption[]
  )

  async function validateWalletExtensionInstalled() {
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
