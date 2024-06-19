import { defineStore } from 'pinia'
import {
  getEthereumAddress,
  getInjectiveAddress,
  getDefaultSubaccountId,
  msgsOrMsgExecMsgs,
  PrivateKey,
  getGenericAuthorizationFromMessageType,
  MsgGrant,
  Msgs
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
} from './../wallet/cosmos'
import {
  validateTrustWallet,
  isTrustWalletInstalled
} from './../wallet/trust-wallet'
import { IS_DEVNET } from './../utils/constant'
import { validatePhantom, isPhantomInstalled } from './../wallet/phantom'
import { walletStrategy } from './../wallet/wallet-strategy'
import { confirm, connect, getAddresses } from './../wallet/wallet'
import { isBitGetInstalled, validateBitGet } from './../wallet/bitget'
import { validateMetamask, isMetamaskInstalled } from './../wallet/metamask'
import { validateOkxWallet, isOkxWalletInstalled } from './../wallet/okx-wallet'
import { EventBus, GrantDirection, WalletConnectStatus } from './../types'
import { AutoSign } from '~/types/wallet'
import { msgBroadcaster } from '~/WalletService'

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
        getDefaultSubaccountId(state.injectiveAddress)
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

      await connect({
        wallet: walletStore.autoSign?.privateKey
          ? Wallet.PrivateKey
          : walletStore.wallet,
        options: { privateKey: walletStore.autoSign?.privateKey }
      })
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
      const session = await walletStrategy.getSessionOrConfirm()

      walletStore.$patch({
        injectiveAddress,
        addresses: injectiveAddresses,
        address: getEthereumAddress(injectiveAddress),
        addressConfirmation: await confirm(injectiveAddress),
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
        addressConfirmation: await confirm(injectiveAddress),
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
        addressConfirmation: await confirm(injectiveAddress),
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
        addressConfirmation: await confirm(ethereumAddress),
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
        addressConfirmation: await confirm(injectiveAddress),
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
        addressConfirmation: await confirm(injectiveAddress),
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
        addressConfirmation: await confirm(address),
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
        addressConfirmation: await confirm(address),
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
        addressConfirmation: await confirm(ethereumAddress),
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
        addressConfirmation: await confirm(address),
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
        addressConfirmation: await confirm(address),
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
        addressConfirmation: await confirm(address),
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
        addressConfirmation: await confirm(address),
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
        addressConfirmation: await confirm(address),
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
        addressConfirmation: await confirm(address),
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
      } else if (walletStore.isAuthzWalletConnected) {
        actualMessage = msgsOrMsgExecMsgs(msgs, walletStore.injectiveAddress)
      } else {
        actualMessage = msgs
      }

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

    connectAuthZ(
      injectiveAddress: string,
      direction: GrantDirection = GrantDirection.Granter
    ) {
      const walletStore = useSharedWalletStore()

      walletStore.$patch({
        authZ: {
          direction,
          injectiveAddress,
          address: getEthereumAddress(injectiveAddress),
          defaultSubaccountId: getDefaultSubaccountId(injectiveAddress)
        }
      })

      useEventBus(EventBus.WalletConnected).emit()
      useEventBus(EventBus.SubaccountChange).emit()
    },

    async connectAutoSign(msgsType: string[]) {
      const walletStore = useSharedWalletStore()

      const { privateKey } = PrivateKey.generate()
      const injectiveAddress = privateKey.toBech32()

      // const tradingMessages = [
      //   MsgType.MsgCancelSpotOrder,
      //   MsgType.MsgCreateSpotLimitOrder,
      //   MsgType.MsgCancelDerivativeOrder,
      //   MsgType.MsgCreateSpotMarketOrder,
      //   MsgType.MsgBatchCancelSpotOrders,
      //   MsgType.MsgCreateDerivativeLimitOrder,
      //   MsgType.MsgCreateDerivativeMarketOrder,
      //   MsgType.MsgBatchCancelDerivativeOrders
      // ]

      const nowInSeconds = Math.floor(Date.now() / 1000)
      const expirationInSeconds = 60 * 60 // 1 hour

      const authZMsgs = msgsType.map((messageType) =>
        MsgGrant.fromJSON({
          grantee: injectiveAddress,
          granter: walletStore.injectiveAddress,
          expiration: nowInSeconds + expirationInSeconds,
          authorization: getGenericAuthorizationFromMessageType(messageType)
        })
      )

      await walletStore.broadcastWithFeeDelegation(authZMsgs)

      const autoSign = {
        injectiveAddress,
        privateKey: privateKey.toPrivateKeyHex(),
        expiration: nowInSeconds + expirationInSeconds,
        duration: expirationInSeconds
      }

      walletStore.$patch({
        autoSign
      })

      await connect({
        wallet: Wallet.PrivateKey,
        options: { privateKey: autoSign.privateKey }
      })
    },

    async validateAutoSign(msgsType: string[]) {
      const walletStore = useSharedWalletStore()

      if (!walletStore.isAutoSignEnabled) {
        return
      }

      const autoSign = walletStore.autoSign as AutoSign
      const nowInSeconds = Math.floor(Date.now() / 1000)

      if (autoSign.expiration > nowInSeconds) {
        return
      }

      const expirationInSeconds = autoSign.duration || 3600

      const authZMsgs = msgsType.map((messageType) =>
        MsgGrant.fromJSON({
          grantee: autoSign.injectiveAddress,
          granter: walletStore.injectiveAddress,
          expiration: nowInSeconds + expirationInSeconds,
          authorization: getGenericAuthorizationFromMessageType(messageType)
        })
      )

      await connect({ wallet: walletStore.wallet })

      await msgBroadcaster.broadcastWithFeeDelegation({
        msgs: authZMsgs,
        injectiveAddress: walletStore.injectiveAddress
      })

      walletStore.$patch((state) => {
        state.autoSign = {
          ...autoSign,
          expiration: expirationInSeconds
        }
      })

      await connect({
        wallet: Wallet.PrivateKey,
        options: { privateKey: autoSign.privateKey }
      })
    },

    resetAuthZ() {
      const walletStore = useSharedWalletStore()

      walletStore.resetAuthZ()

      useEventBus(EventBus.WalletConnected).emit()
      useEventBus(EventBus.SubaccountChange).emit()
    },

    async disconnectAutoSign() {
      const walletStore = useSharedWalletStore()

      walletStore.$patch({
        autoSign: undefined
      })

      await connect({ wallet: walletStore.wallet })
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
