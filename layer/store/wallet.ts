import { defineStore } from 'pinia'
import {
  getEthereumAddress,
  getInjectiveAddress,
  getDefaultSubaccountId
} from '@injectivelabs/sdk-ts'
import { StatusType } from '@injectivelabs/utils'
import { Wallet, isCosmosWallet } from '@injectivelabs/wallet-ts'
import { IS_DEVNET } from './../utils/constant'
import { validateCosmosWallet } from './../wallet/cosmos'
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
  metamaskInstalled: boolean
  wallet: Wallet
  queueStatus: StatusType
}

const initialStateFactory = (): WalletStoreState => ({
  walletConnectStatus: WalletConnectStatus.idle,
  address: '',
  injectiveAddress: '',
  addressConfirmation: '',
  addresses: [],
  metamaskInstalled: false,
  wallet: Wallet.Metamask,
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

      if (isCosmosWallet(walletStore.wallet)) {
        await validateCosmosWallet({
          wallet: walletStore.wallet,
          address: walletStore.injectiveAddress
        })
      }
    },

    async validateAndQueue() {
      const walletStore = useSharedWalletStore()

      await walletStore.validate()

      if (walletStore.queueStatus === StatusType.Loading) {
        throw new Error('You have a pending transaction.')
      } else {
        walletStore.$patch({
          queueStatus: StatusType.Loading
        })
      }
    },

    async init() {
      const walletStore = useSharedWalletStore()

      await connect({ wallet: walletStore.wallet })
    },

    onConnect() {
      const modalStore = useSharedModalStore()
      const walletStore = useSharedWalletStore()

      modalStore.closeAll()

      useEventBus(EventBus.WalletConnected).emit()

      walletStore.$patch({
        walletConnectStatus: WalletConnectStatus.connected
      })
    },

    async checkIsMetamaskInstalled() {
      this.metamaskInstalled = await isMetamaskInstalled()
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

      if (walletStore.addresses.length === 0 || walletStore.wallet !== wallet) {
        await connect({ wallet })

        walletStore.$patch({
          wallet,
          addresses: await getAddresses()
        })
      } else {
        const newAddresses = await getAddresses()

        walletStore.$patch({
          addresses: [...walletStore.addresses, ...newAddresses]
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

    async connectKeplr() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Keplr)

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

    async connectLedger({
      wallet,
      address
    }: {
      wallet: Wallet
      address: string
    }) {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(wallet)

      walletStore.$patch({
        address,
        addresses: [address],
        injectiveAddress: getInjectiveAddress(address),
        addressConfirmation: await confirm(address)
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

      walletStore.$patch({
        addresses: [address],
        address,
        injectiveAddress: getInjectiveAddress(address),
        addressConfirmation: await confirm(address)
      })

      await walletStore.onConnect()
    },

    async logout() {
      const walletStore = useSharedWalletStore()

      await walletStrategy.disconnect()

      walletStore.$patch({
        ...initialStateFactory(),
        metamaskInstalled: walletStore.metamaskInstalled,
        walletConnectStatus: WalletConnectStatus.disconnected
      })
    }
  }
})
