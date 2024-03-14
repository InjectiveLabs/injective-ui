import { defineStore } from 'pinia'
import {
  getEthereumAddress,
  getInjectiveAddress,
  getDefaultSubaccountId
} from '@injectivelabs/sdk-ts'
import { StatusType } from '@injectivelabs/utils'
import {
  Wallet,
  isEthWallet,
  isCosmosWallet,
  isCosmosBrowserWallet
} from '@injectivelabs/wallet-ts'
import {
  validateTrustWallet,
  isTrustWalletInstalled
} from './../wallet/trust-wallet'
import { validateOkxWallet, isOkxWalletInstalled } from './../wallet/okx-wallet'
import { isPhantomInstalled } from './../wallet/phantom'
import { IS_DEVNET } from './../utils/constant'
import {
  validateCosmosWallet,
  confirmCorrectKeplrAddress
} from './../wallet/cosmos'
import { walletStrategy } from './../wallet/wallet-strategy'
import { confirm, connect, getAddresses } from './../wallet/wallet'
import { validateMetamask, isMetamaskInstalled } from './../wallet/metamask'
import { EventBus, WalletConnectStatus } from './../types'

type WalletStoreState = {
  walletConnectStatus: WalletConnectStatus
  address: string
  injectiveAddress: string
  addressConfirmation: string
  addresses: string[]
  hwAddresses: string[]
  phantomInstalled: boolean
  metamaskInstalled: boolean
  okxWalletInstalled: boolean
  trustWalletInstalled: boolean
  wallet: Wallet
  queueStatus: StatusType
}

const initialStateFactory = (): WalletStoreState => ({
  walletConnectStatus: WalletConnectStatus.idle,
  address: '',
  injectiveAddress: '',
  addressConfirmation: '',
  addresses: [],
  hwAddresses: [],
  wallet: Wallet.Metamask,
  phantomInstalled: false,
  metamaskInstalled: false,
  okxWalletInstalled: false,
  trustWalletInstalled: false,
  queueStatus: StatusType.Idle
})

export const useSharedWalletStore = defineStore('sharedWallet', {
  state: (): WalletStoreState => initialStateFactory(),
  getters: {
    isUserConnected: (state) => {
      const addressConnectedAndConfirmed =
        !!state.address && !!state.addressConfirmation
      const hasAddresses = state.addresses.length > 0

      return (
        state.walletConnectStatus !== WalletConnectStatus.connecting &&
        hasAddresses &&
        addressConnectedAndConfirmed &&
        !!state.injectiveAddress
      )
    },

    isWalletExemptFromGasFee: (state) => {
      return !isCosmosWallet(state.wallet) && !IS_DEVNET
    },

    defaultSubaccountId: (state) => {
      if (!state.injectiveAddress) {
        return undefined
      }

      return getDefaultSubaccountId(state.injectiveAddress)
    }
  },
  actions: {
    async validate() {
      const walletStore = useSharedWalletStore()

      if (walletStore.wallet === Wallet.Metamask) {
        await validateMetamask(walletStore.address)
      }

      if (walletStore.wallet === Wallet.TrustWallet) {
        await validateTrustWallet(walletStore.address)
      }

      if (walletStore.wallet === Wallet.OkxWallet) {
        await validateOkxWallet(walletStore.address)
      }

      if (isCosmosBrowserWallet(walletStore.wallet)) {
        await validateCosmosWallet({
          wallet: walletStore.wallet,
          address: walletStore.injectiveAddress
        })
      }
    },

    queue() {
      const walletStore = useSharedWalletStore()

      if (walletStore.queueStatus === StatusType.Loading) {
        throw new Error('You have a pending transaction.')
      } else {
        walletStore.$patch({
          queueStatus: StatusType.Loading
        })
      }
    },

    async validateAndQueue() {
      const sharedWalletStore = useSharedWalletStore()

      await sharedWalletStore.validate()

      sharedWalletStore.queue()
    },

    async init() {
      const walletStore = useSharedWalletStore()

      await connect({ wallet: walletStore.wallet })
    },

    onConnect() {
      const modalStore = useSharedModalStore()
      const walletStore = useSharedWalletStore()

      modalStore.closeAll()

      walletStore.$patch({
        walletConnectStatus: WalletConnectStatus.connected
      })

      useEventBus(EventBus.WalletConnected).emit()
    },

    async checkIsMetamaskInstalled() {
      const walletStore = useSharedWalletStore()

      walletStore.$patch({
        metamaskInstalled: await isMetamaskInstalled()
      })
    },

    async checkIsTrustWalletInstalled() {
      const walletStore = useSharedWalletStore()

      walletStore.$patch({
        trustWalletInstalled: await isTrustWalletInstalled()
      })
    },

    async checkIsOkxWalletInstalled() {
      const walletStore = useSharedWalletStore()

      walletStore.$patch({
        okxWalletInstalled: await isOkxWalletInstalled()
      })
    },

    async checkIsPhantomWalletInstalled() {
      const walletStore = useSharedWalletStore()

      walletStore.$patch({
        phantomInstalled: await isPhantomInstalled()
      })
    },

    async connectWallet(wallet: Wallet) {
      const walletStore = useSharedWalletStore()

      walletStore.$patch({
        walletConnectStatus: WalletConnectStatus.connecting,
        wallet
      })

      await connect({ wallet })
    },

    async getHWAddresses(wallet: Wallet) {
      const walletStore = useSharedWalletStore()

      if (
        walletStore.hwAddresses.length === 0 ||
        walletStore.wallet !== wallet
      ) {
        await connect({ wallet })

        walletStore.$patch({
          wallet
        })

        const addresses = await getAddresses()

        const injectiveAddresses = isEthWallet(wallet)
          ? addresses.map(getInjectiveAddress)
          : addresses

        walletStore.$patch({
          hwAddresses: injectiveAddresses
        })
      } else {
        const addresses = await getAddresses()
        const injectiveAddresses = isEthWallet(wallet)
          ? addresses.map(getInjectiveAddress)
          : addresses

        walletStore.$patch({
          hwAddresses: [...walletStore.hwAddresses, ...injectiveAddresses]
        })
      }
    },

    async connectCosmosStation() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Cosmostation)

      const injectiveAddresses = await getAddresses()
      const [injectiveAddress] = injectiveAddresses

      walletStore.$patch({
        injectiveAddress,
        addresses: injectiveAddresses,
        address: getEthereumAddress(injectiveAddress),
        addressConfirmation: await confirm(injectiveAddress)
      })

      await walletStore.onConnect()
    },

    async connectNinji() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Ninji)

      const injectiveAddresses = await getAddresses()
      const [injectiveAddress] = injectiveAddresses

      walletStore.$patch({
        injectiveAddress,
        addresses: injectiveAddresses,
        address: getEthereumAddress(injectiveAddress),
        addressConfirmation: await confirm(injectiveAddress)
      })

      await walletStore.onConnect()
    },

    async connectKeplr() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Keplr)

      const injectiveAddresses = await getAddresses()
      const [injectiveAddress] = injectiveAddresses

      await confirmCorrectKeplrAddress(injectiveAddress)

      walletStore.$patch({
        injectiveAddress,
        addresses: injectiveAddresses,
        address: getEthereumAddress(injectiveAddress),
        addressConfirmation: await confirm(injectiveAddress)
      })

      await walletStore.onConnect()
    },

    async connectLedger({
      wallet,
      address
    }: {
      wallet: Wallet
      address: string
    }) {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(wallet)

      const ethereumAddress = getEthereumAddress(address)

      walletStore.$patch({
        address: ethereumAddress,
        injectiveAddress: address,
        addresses: [ethereumAddress],
        addressConfirmation: await confirm(ethereumAddress)
      })

      await walletStore.onConnect()
    },

    async connectLedgerCosmos(injectiveAddress: string) {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.LedgerCosmos)

      const ethereumAddress = getEthereumAddress(injectiveAddress)

      walletStore.$patch({
        injectiveAddress,
        address: ethereumAddress,
        addresses: [ethereumAddress],
        addressConfirmation: await confirm(injectiveAddress)
      })

      await walletStore.onConnect()
    },

    async connectLeap() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Leap)

      const injectiveAddresses = await getAddresses()
      const [injectiveAddress] = injectiveAddresses

      walletStore.$patch({
        injectiveAddress,
        addresses: injectiveAddresses,
        address: getEthereumAddress(injectiveAddress),
        addressConfirmation: await confirm(injectiveAddress)
      })

      await walletStore.onConnect()
    },

    async connectMetamask() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Metamask)

      const addresses = await getAddresses()
      const [address] = addresses

      walletStore.$patch({
        addresses,
        address,
        injectiveAddress: getInjectiveAddress(address),
        addressConfirmation: await confirm(address)
      })

      await walletStore.onConnect()
    },

    async connectTorus() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Torus)

      const addresses = await getAddresses()
      const [address] = addresses

      walletStore.$patch({
        addresses,
        address,
        injectiveAddress: getInjectiveAddress(address),
        addressConfirmation: await confirm(address)
      })

      await walletStore.onConnect()
    },

    async connectTrezor(address: string) {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Trezor)

      const ethereumAddress = getEthereumAddress(address)

      walletStore.$patch({
        address: ethereumAddress,
        injectiveAddress: address,
        addresses: [ethereumAddress],
        addressConfirmation: await confirm(ethereumAddress)
      })

      await walletStore.onConnect()
    },

    async connectTrustWallet() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.TrustWallet)

      const addresses = await getAddresses()
      const [address] = addresses

      walletStore.$patch({
        address,
        addresses,
        injectiveAddress: getInjectiveAddress(address),
        addressConfirmation: await confirm(address)
      })

      await walletStore.onConnect()
    },

    async connectWalletConnect() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.WalletConnect)

      const addresses = await getAddresses()
      const [address] = addresses

      walletStore.$patch({
        address,
        addresses,
        addressConfirmation: await confirm(address),
        injectiveAddress: getInjectiveAddress(address)
      })

      await walletStore.onConnect()
    },

    async connectOkxWallet() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.OkxWallet)

      const addresses = await getAddresses()
      const [address] = addresses

      walletStore.$patch({
        address,
        addresses,
        addressConfirmation: await confirm(address),
        injectiveAddress: getInjectiveAddress(address)
      })

      await walletStore.onConnect()
    },

    async connectPhantomWallet() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Phantom)

      const addresses = await getAddresses()
      const [address] = addresses

      walletStore.$patch({
        address,
        addresses,
        addressConfirmation: await confirm(address),
        injectiveAddress: getInjectiveAddress(address)
      })

      await walletStore.onConnect()
    },

    async logout() {
      const walletStore = useSharedWalletStore()

      await walletStrategy.disconnect()

      walletStore.$patch({
        ...initialStateFactory(),
        queueStatus: StatusType.Idle,
        metamaskInstalled: walletStore.metamaskInstalled,
        okxWalletInstalled: walletStore.okxWalletInstalled,
        walletConnectStatus: WalletConnectStatus.disconnected
      })
    }
  }
})
