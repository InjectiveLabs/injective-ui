import { defineStore } from 'pinia'
import {
  Msgs,
  msgsOrMsgExecMsgs,
  getEthereumAddress,
  getInjectiveAddress,
  getDefaultSubaccountId
} from '@injectivelabs/sdk-ts'
import { GeneralException } from '@injectivelabs/exceptions'
import { StatusType } from '@injectivelabs/utils'
import {
  Wallet,
  isEthWallet,
  isCosmosWallet,
  isCosmosBrowserWallet
} from '@injectivelabs/wallet-ts'
import {
  validateCosmosWallet,
  confirmCorrectKeplrAddress
} from './../../wallet/cosmos'
import {
  validateOkxWallet,
  isOkxWalletInstalled
} from './../../wallet/okx-wallet'
import {
  validateTrustWallet,
  isTrustWalletInstalled
} from './../../wallet/trust-wallet'
import { IS_DEVNET } from './../../utils/constant'
import { getAddresses } from './../../wallet/wallet'
import { walletStrategy } from './../../wallet/wallet-strategy'
import { isBitGetInstalled, validateBitGet } from './../../wallet/bitget'
import { validatePhantom, isPhantomInstalled } from './../../wallet/phantom'
import { validateMetamask, isMetamaskInstalled } from './../../wallet/metamask'
import { EventBus, GrantDirection, WalletConnectStatus } from './../../types'
import { AutoSign } from '@/types/wallet'
import { msgBroadcaster } from '@/WalletService'
import {
  resetAuthZ,
  connectAuthZ,
  connectAutoSign,
  validateAutoSign,
  disconnectAutoSign
} from './authz'

type WalletStoreState = {
  walletConnectStatus: WalletConnectStatus
  address: string
  injectiveAddress: string
  addressConfirmation: string
  session: string
  addresses: string[]
  hwAddresses: string[]
  bitGetInstalled: boolean
  phantomInstalled: boolean
  metamaskInstalled: boolean
  okxWalletInstalled: boolean
  trustWalletInstalled: boolean
  wallet: Wallet
  queueStatus: StatusType

  authZ: {
    address: string
    direction: GrantDirection
    injectiveAddress: string
    defaultSubaccountId: string
  }

  autoSign?: AutoSign
}

const initialStateFactory = (): WalletStoreState => ({
  walletConnectStatus: WalletConnectStatus.idle,
  address: '',
  injectiveAddress: '',
  addressConfirmation: '',
  session: '',
  addresses: [],
  hwAddresses: [],
  wallet: Wallet.Metamask,
  bitGetInstalled: false,
  phantomInstalled: false,
  metamaskInstalled: false,
  okxWalletInstalled: false,
  trustWalletInstalled: false,
  queueStatus: StatusType.Idle,

  authZ: {
    address: '',
    direction: GrantDirection.Grantee,
    injectiveAddress: '',
    defaultSubaccountId: ''
  },

  autoSign: undefined
})

export const useSharedWalletStore = defineStore('sharedWallet', {
  state: (): WalletStoreState => initialStateFactory(),
  getters: {
    isUserConnected: (state) => {
      const addressConnectedAndConfirmed =
        !!state.address && !!state.addressConfirmation && !!state.session
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
    },

    isAuthzWalletConnected: (state) => {
      const addressConnectedAndConfirmed =
        !!state.address && !!state.addressConfirmation
      const hasAddresses = state.addresses.length > 0
      const isUserWalletConnected =
        hasAddresses && addressConnectedAndConfirmed && !!state.injectiveAddress

      console.log({
        addressConnectedAndConfirmed,
        isUserWalletConnected,
        authZAddress: state.authZ.address,
        authZInjectiveAddress: state.authZ.injectiveAddress
      })

      console.log(
        'isTrue',
        isUserWalletConnected &&
          !!state.authZ.address &&
          !!state.authZ.injectiveAddress
      )
      return (
        isUserWalletConnected &&
        !!state.authZ.address &&
        !!state.authZ.injectiveAddress
      )
    },

    authZOrInjectiveAddress: (state) => {
      return state.authZ.injectiveAddress || state.injectiveAddress
    },

    authZOrDefaultSubaccountId: (state) => {
      return (
        state.authZ.defaultSubaccountId ||
        (state.injectiveAddress &&
          getDefaultSubaccountId(state.injectiveAddress)) ||
        ''
      )
    },

    authZOrAddress: (state) => {
      return state.authZ.address || state.address
    },

    isAutoSignEnabled: (state) => {
      return !!state.autoSign?.injectiveAddress && !!state.autoSign?.privateKey
    }
  },
  actions: {
    resetAuthZ,
    connectAuthZ,
    connectAutoSign,
    validateAutoSign,
    disconnectAutoSign,

    async validate() {
      const walletStore = useSharedWalletStore()

      if (walletStore.autoSign) {
        console.log(' auto sign')
        return
      }

      if (walletStore.wallet === Wallet.Metamask) {
        await validateMetamask(walletStore.address)
      }

      if (walletStore.wallet === Wallet.TrustWallet) {
        await validateTrustWallet(walletStore.address)
      }

      if (walletStore.wallet === Wallet.OkxWallet) {
        await validateOkxWallet(walletStore.address)
      }

      if (walletStore.wallet === Wallet.BitGet) {
        await validateBitGet(walletStore.address)
      }

      if (walletStore.wallet === Wallet.Phantom) {
        await validatePhantom(walletStore.address)
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

      walletStrategy.setWallet(walletStore.wallet)

      if (walletStore.autoSign && walletStore.autoSign?.privateKey) {
        walletStrategy.disconnect()
        walletStrategy.setWallet(Wallet.PrivateKey)
        walletStrategy.setOptions({
          privateKey: walletStore.autoSign?.privateKey
        })
      }
    },

    onConnect() {
      const modalStore = useSharedModalStore()
      const walletStore = useSharedWalletStore()

      modalStore.closeAll()

      walletStore.$patch({
        walletConnectStatus: WalletConnectStatus.connected
      })

      useEventBus(EventBus.WalletConnected).emit()
      useEventBus(EventBus.SubaccountChange).emit()
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

    async checkIsBitGetInstalled() {
      const walletStore = useSharedWalletStore()

      walletStore.$patch({
        bitGetInstalled: await isBitGetInstalled()
      })
    },

    async checkIsPhantomWalletInstalled() {
      const walletStore = useSharedWalletStore()

      walletStore.$patch({
        phantomInstalled: await isPhantomInstalled()
      })
    },

    async connectWallet(
      wallet: Wallet,
      options?: { privateKey: string; isAutoSign: boolean }
    ) {
      const walletStore = useSharedWalletStore()

      console.log('set wallet:', wallet)

      walletStrategy.disconnect()
      walletStrategy.setWallet(wallet)

      console.log({
        walletStrategy
      })

      if (options?.privateKey) {
        walletStrategy.setOptions({ privateKey: options.privateKey })
      }

      if (!options?.isAutoSign) {
        console.log('setting wallet store wallet')

        walletStore.$patch({
          walletConnectStatus: WalletConnectStatus.connecting,
          wallet
        })
      }
    },

    async getHWAddresses(wallet: Wallet) {
      const walletStore = useSharedWalletStore()

      if (
        walletStore.hwAddresses.length === 0 ||
        walletStore.wallet !== wallet
      ) {
        walletStrategy.disconnect()
        walletStrategy.setWallet(wallet)

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
      const session = await walletStrategy.getSessionOrConfirm()

      walletStore.$patch({
        injectiveAddress,
        addresses: injectiveAddresses,
        address: getEthereumAddress(injectiveAddress),
        addressConfirmation: await walletStrategy.getSessionOrConfirm(
          injectiveAddress
        ),
        session
      })

      await walletStore.onConnect()
    },

    async connectNinji() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Ninji)

      const injectiveAddresses = await getAddresses()
      const [injectiveAddress] = injectiveAddresses
      const session = await walletStrategy.getSessionOrConfirm()

      walletStore.$patch({
        injectiveAddress,
        addresses: injectiveAddresses,
        address: getEthereumAddress(injectiveAddress),
        addressConfirmation: await walletStrategy.getSessionOrConfirm(
          injectiveAddress
        ),
        session
      })

      await walletStore.onConnect()
    },

    async connectKeplr() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Keplr)

      const injectiveAddresses = await getAddresses()
      const [injectiveAddress] = injectiveAddresses
      const session = await walletStrategy.getSessionOrConfirm()

      await confirmCorrectKeplrAddress(injectiveAddress)

      walletStore.$patch({
        injectiveAddress,
        addresses: injectiveAddresses,
        address: getEthereumAddress(injectiveAddress),
        addressConfirmation: await walletStrategy.getSessionOrConfirm(
          injectiveAddress
        ),
        session
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
      const session = await walletStrategy.getSessionOrConfirm(ethereumAddress)

      walletStore.$patch({
        address: ethereumAddress,
        injectiveAddress: address,
        addresses: [ethereumAddress],
        addressConfirmation: await walletStrategy.getSessionOrConfirm(
          ethereumAddress
        ),
        session
      })

      await walletStore.onConnect()
    },

    async connectLedgerCosmos(injectiveAddress: string) {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.LedgerCosmos)

      const ethereumAddress = getEthereumAddress(injectiveAddress)
      const session = await walletStrategy.getSessionOrConfirm()

      walletStore.$patch({
        injectiveAddress,
        address: ethereumAddress,
        addresses: [ethereumAddress],
        addressConfirmation: await walletStrategy.getSessionOrConfirm(
          injectiveAddress
        ),
        session
      })

      await walletStore.onConnect()
    },

    async connectLeap() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Leap)

      const injectiveAddresses = await getAddresses()
      const [injectiveAddress] = injectiveAddresses
      const session = await walletStrategy.getSessionOrConfirm()

      walletStore.$patch({
        injectiveAddress,
        addresses: injectiveAddresses,
        address: getEthereumAddress(injectiveAddress),
        addressConfirmation: await walletStrategy.getSessionOrConfirm(
          injectiveAddress
        ),
        session
      })

      await walletStore.onConnect()
    },

    async connectMetamask() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Metamask)

      const addresses = await getAddresses()
      const [address] = addresses
      const session = await walletStrategy.getSessionOrConfirm(address)

      walletStore.$patch({
        addresses,
        address,
        injectiveAddress: getInjectiveAddress(address),
        addressConfirmation: await walletStrategy.getSessionOrConfirm(address),
        session
      })

      await walletStore.onConnect()
    },

    async connectTorus() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Torus)

      const addresses = await getAddresses()
      const [address] = addresses
      const session = await walletStrategy.getSessionOrConfirm(address)

      walletStore.$patch({
        addresses,
        address,
        injectiveAddress: getInjectiveAddress(address),
        addressConfirmation: await walletStrategy.getSessionOrConfirm(address),
        session
      })

      await walletStore.onConnect()
    },

    async connectTrezor(address: string) {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Trezor)

      const ethereumAddress = getEthereumAddress(address)
      const session = await walletStrategy.getSessionOrConfirm(ethereumAddress)

      walletStore.$patch({
        address: ethereumAddress,
        injectiveAddress: address,
        addresses: [ethereumAddress],
        addressConfirmation: await walletStrategy.getSessionOrConfirm(
          ethereumAddress
        ),
        session
      })

      await walletStore.onConnect()
    },

    async connectTrustWallet() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.TrustWallet)

      const addresses = await getAddresses()
      const [address] = addresses
      const session = await walletStrategy.getSessionOrConfirm(address)

      walletStore.$patch({
        address,
        addresses,
        injectiveAddress: getInjectiveAddress(address),
        addressConfirmation: await walletStrategy.getSessionOrConfirm(address),
        session
      })

      await walletStore.onConnect()
    },

    async connectWalletConnect() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.WalletConnect)

      const addresses = await getAddresses()
      const [address] = addresses
      const session = await walletStrategy.getSessionOrConfirm(address)

      walletStore.$patch({
        address,
        addresses,
        addressConfirmation: await walletStrategy.getSessionOrConfirm(address),
        injectiveAddress: getInjectiveAddress(address),
        session
      })

      await walletStore.onConnect()
    },

    async connectOkxWallet() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.OkxWallet)

      const addresses = await getAddresses()
      const [address] = addresses
      const session = await walletStrategy.getSessionOrConfirm(address)

      walletStore.$patch({
        address,
        addresses,
        addressConfirmation: await walletStrategy.getSessionOrConfirm(address),
        injectiveAddress: getInjectiveAddress(address),
        session
      })

      await walletStore.onConnect()
    },

    async connectPhantomWallet() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Phantom)

      const addresses = await getAddresses()
      const [address] = addresses
      const session = await walletStrategy.getSessionOrConfirm(address)

      walletStore.$patch({
        address,
        addresses,
        addressConfirmation: await walletStrategy.getSessionOrConfirm(address),
        injectiveAddress: getInjectiveAddress(address),
        session
      })

      await walletStore.onConnect()
    },

    async connectBitGet() {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.BitGet)

      const addresses = await getAddresses()
      const [address] = addresses
      const session = await walletStrategy.getSessionOrConfirm(address)

      walletStore.$patch({
        address,
        addresses,
        addressConfirmation: await walletStrategy.getSessionOrConfirm(address),
        injectiveAddress: getInjectiveAddress(address),
        session
      })

      await walletStore.onConnect()
    },

    async connectAddress(injectiveAddress: string) {
      const walletStore = useSharedWalletStore()

      await walletStore.connectWallet(Wallet.Metamask)

      const addresses = [getEthereumAddress(injectiveAddress)]
      const [address] = addresses
      const session = await walletStrategy.getSessionOrConfirm(address)

      walletStore.$patch({
        address,
        addresses,
        injectiveAddress,
        addressConfirmation: await walletStrategy.getSessionOrConfirm(address),
        session
      })

      await walletStore.onConnect()
    },

    async broadcastMessages(
      messages: Msgs | Msgs[],
      memo?: string,
      isFeeDelegated: boolean = false
    ) {
      const walletStore = useSharedWalletStore()
      const msgs = Array.isArray(messages) ? messages : [messages]

      if (!walletStore.isUserConnected) {
        return
      }

      let actualMessage

      if (walletStore.autoSign && walletStore.isAuthzWalletConnected) {
        // error becase we don't support authz + auto-sign
        throw new GeneralException(
          new Error('Authz and auto-sign cannot be used together')
        )

        // TODO: uncomment this when we support authz + auto-sign
        // actualMessage = msgsOrMsgExecMsgs(
        //   msgsOrMsgExecMsgs(msgs, walletStore.injectiveAddress),
        //   walletStore.autoSign.injectiveAddress
        // )
      } else if (walletStore.autoSign && !walletStore.isAuthzWalletConnected) {
        actualMessage = msgsOrMsgExecMsgs(
          msgs,
          walletStore.autoSign.injectiveAddress
        )

        console.log('auto sign', actualMessage)
      } else if (walletStore.isAuthzWalletConnected) {
        actualMessage = msgsOrMsgExecMsgs(msgs, walletStore.injectiveAddress)

        console.log('authz', actualMessage)
      } else {
        actualMessage = msgs
        console.log('no authz or autosign', { actualMessage })
      }

      console.log({
        isAutosign: !!walletStore.autoSign,
        walletStrategy
      })

      const broadcastOptions = {
        msgs: actualMessage,
        injectiveAddress: walletStore.autoSign
          ? walletStore.autoSign.injectiveAddress
          : walletStore.injectiveAddress,
        memo
      }

      if (isFeeDelegated) {
        const response = await msgBroadcaster.broadcastWithFeeDelegation(
          broadcastOptions
        )

        return response
      }

      const response = await msgBroadcaster.broadcast(broadcastOptions)

      return response
    },

    async broadcastWithFeeDelegation(messages: Msgs | Msgs[], memo?: string) {
      const walletStore = useSharedWalletStore()
      return await walletStore.broadcastMessages(messages, memo, true)
    },

    async logout() {
      const walletStore = useSharedWalletStore()

      await walletStrategy.disconnect()

      walletStore.$patch({
        ...initialStateFactory(),
        queueStatus: StatusType.Idle,
        bitGetInstalled: walletStore.bitGetInstalled,
        phantomInstalled: walletStore.phantomInstalled,
        metamaskInstalled: walletStore.metamaskInstalled,
        okxWalletInstalled: walletStore.okxWalletInstalled,
        walletConnectStatus: WalletConnectStatus.disconnected,
        trustWalletInstalled: walletStore.trustWalletInstalled
      })
    }
  }
})
