import { Wallet } from '@injectivelabs/wallet-base'
import { IS_HELIX, IS_DEVNET } from '../utils/constant'
import { isCosmosWalletInstalled } from '@injectivelabs/wallet-cosmos'
import { isCosmosStationWalletInstalled } from '@injectivelabs/wallet-cosmostation'
import type { SharedWalletOption } from '../types'

export function useSharedWalletOptions() {
  const sharedWalletStore = useSharedWalletStore()

  const popularOptions = computed(
  () =>
    [
      {
        wallet: Wallet.Keplr,
        downloadLink: !isCosmosWalletInstalled(Wallet.Keplr)
          ? 'https://www.keplr.app/download'
          : undefined
      },
      {
        wallet: Wallet.Metamask,
        downloadLink: !sharedWalletStore.metamaskInstalled
          ? 'https://metamask.io/download'
          : undefined
      },
      IS_DEVNET
        ? undefined
        : {
            wallet: Wallet.Leap,
            downloadLink: !isCosmosWalletInstalled(Wallet.Leap)
              ? 'https://www.leapwallet.io/downloads'
              : undefined
          }
    ].filter((option) => option) as SharedWalletOption[]
  )

  const options = computed(
    () =>
      [
        {
          wallet: Wallet.Rainbow,
          downloadLink: !sharedWalletStore.rainbowInstalled
            ? 'https://rainbow.me/download'
            : undefined
        },
        IS_DEVNET
          ? undefined
          : {
              wallet: Wallet.BitGet,
              downloadLink: !sharedWalletStore.bitGetInstalled
                ? 'https://web3.bitget.com/en/wallet-download'
                : undefined
            },
        {
          wallet: Wallet.OkxWallet,
          downloadLink: !sharedWalletStore.okxWalletInstalled
            ? 'https://www.okx.com/web3'
            : undefined
        },
        { wallet: Wallet.Ledger },
        { wallet: Wallet.TrezorBip32 },
        {
          wallet: Wallet.Cosmostation,
          downloadLink: !isCosmosWalletInstalled(Wallet.Cosmostation)
            ? 'https://www.cosmostation.io/wallet'
            : undefined
        },
        { wallet: Wallet.Phantom },
        {
          wallet: Wallet.Cosmostation,
          downloadLink: !isCosmosStationWalletInstalled()
            ? 'https://www.cosmostation.io/wallet'
            : undefined
        },
        { wallet: Wallet.WalletConnect },
        IS_DEVNET && IS_HELIX
          ? undefined
          : {
              beta: true,
              wallet: Wallet.Ninji,
              downloadLink: !isCosmosWalletInstalled(Wallet.Ninji)
                ? 'https://ninji.xyz/#download'
                : undefined
            },
        IS_HELIX ? { wallet: Wallet.Magic } : undefined,
        // Disabled for now
        // {
        //   wallet: Wallet.TrustWallet,
        //   downloadLink: !sharedWalletStore.trustWalletInstalled
        //     ? 'https://trustwallet.com/browser-extension/'
        //     : undefined
        // },
        // todo check with achilleas
        // IS_HUB ? {
        //   wallet: Wallet.WalletConnect
        // } : undefined
      ].filter((option) => option) as SharedWalletOption[]
  )

  async function validateWalletExtensionInstalled() {
    await Promise.all(
      [
        sharedWalletStore.checkIsBitGetInstalled(),
        sharedWalletStore.checkIsRainbowInstalled(),
        sharedWalletStore.checkIsMetamaskInstalled(),
        sharedWalletStore.checkIsOkxWalletInstalled(),
        sharedWalletStore.checkIsTrustWalletInstalled(),
        sharedWalletStore.checkIsPhantomWalletInstalled()
      ]
    )
  }

  return {
    options,
    popularOptions,
    validateWalletExtensionInstalled
  }
}
