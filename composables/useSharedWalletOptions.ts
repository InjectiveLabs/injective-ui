import { Wallet } from '@injectivelabs/wallet-base'
import { isCosmosWalletInstalled } from '@injectivelabs/wallet-cosmos'
import { isCosmosStationWalletInstalled } from '@injectivelabs/wallet-cosmostation'
import { IS_DEVNET, IS_MAINNET, IS_HELIX } from '../utils/constant'
import type { SharedWalletOption } from '../types'

export function useSharedWalletOptions() {
  const sharedWalletStore = useSharedWalletStore()

  const popularOptions = computed(
  () =>
    [
      {
        wallet: Wallet.Metamask,
        downloadLink: !sharedWalletStore.metamaskInstalled
          ? 'https://metamask.io/download'
          : undefined
      },
      {
        wallet: Wallet.Keplr,
        downloadLink: !isCosmosWalletInstalled(Wallet.Keplr)
          ? 'https://www.keplr.app/download'
          : undefined
      },
      {
        wallet: Wallet.Rabby,
        downloadLink: !sharedWalletStore.rabbyInstalled
          ? 'https://rabby.io/'
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
        {
          wallet: Wallet.Leap,
          downloadLink: !isCosmosWalletInstalled(Wallet.Leap)
            ? 'https://www.leapwallet.io/downloads'
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
        // {
        //   wallet: Wallet.TrustWallet,
        //   downloadLink: !sharedWalletStore.trustWalletInstalled
        //     ? 'https://trustwallet.com/browser-extension/'
        //     : undefined
        // },
        {
          wallet: Wallet.Cosmostation,
          downloadLink: !isCosmosStationWalletInstalled()
            ? 'https://www.cosmostation.io/wallet'
            : undefined
        },
        { wallet: Wallet.Phantom },
        IS_MAINNET ? { wallet: Wallet.WalletConnect } : undefined,
        !IS_HELIX || IS_DEVNET
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
        sharedWalletStore.checkIsRabbyWalletInstalled(),
        // sharedWalletStore.checkIsTrustWalletInstalled(),
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
