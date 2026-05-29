import { defineStore } from 'pinia'
import { StatusType } from '@injectivelabs/utils'
import { lazyPiniaAction } from '../../utils/pinia'
import { GeneralException } from '@injectivelabs/exceptions'
import { PrivateKey } from '@injectivelabs/sdk-ts/core/accounts'
import { IS_DEVNET, IS_TRUE_CURRENT } from '../../utils/constant'
import { Wallet, isEvmWallet, isCosmosWallet } from '@injectivelabs/wallet-base'
import {
  checkUnauthorizedMessages,
  normalizeBroadcastMessages
} from '../../wallet/utils/broadcast'
import {
  getEthereumAddress,
  getInjectiveAddress,
  getDefaultSubaccountId
} from '@injectivelabs/sdk-ts/utils'
import {
  clearAutoSignKey,
  getAutoSignPayload,
  withAutoSignPrivateKey,
  deriveAndStoreAutoSignKey
} from '../../wallet/autosign'
import {
  MsgGrant,
  msgsOrMsgExecMsgs,
  MsgGrantWithAuthorization,
  getGenericAuthorizationFromMessageType
} from '@injectivelabs/sdk-ts/core/modules'
import {
  getAutoSignGrantConfig,
  getMissingGrantMessages,
  fetchGranterGrantsNoThrow,
  getAutoSignGrantExpiration,
  hasMissingOrExpiringGrants,
  AUTO_SIGN_RENEWAL_THRESHOLD
} from '../../wallet/utils/authz'
import {
  getAddresses,
  getMsgBroadcaster,
  getWalletStrategy,
  validateEvmWallet,
  getHwAddressesInfo,
  validateCosmosWallet,
  getAutoSignWalletStrategy,
  getAutoSignMsgBroadcaster,
  confirmCosmosWalletAddress
} from '@shared/wallet'
import { web3GatewayService } from '../../service'
import { EventBus, GrantDirection, WalletConnectStatus } from '../../types'
import type { Wallet as WalletType } from '@injectivelabs/wallet-base'
import type { MsgBroadcasterTxOptions } from '@injectivelabs/wallet-core'
import type {
  Msgs,
  ContractExecutionCompatAuthz,
  GrantAuthorizationWithDecodedAuthorization
} from '@injectivelabs/sdk-ts'
import type { AutoSign } from '../../types'
import type { ConnectAutoSignOptions } from '../../wallet/utils/authz'

const AUTO_SIGN_GRANT_DURATION = 60 * 60 * 24 * 60

const evmWalletsWithValidation = [
  Wallet.Rabby,
  Wallet.BitGet,
  Wallet.Phantom,
  Wallet.KeplrEvm,
  Wallet.Metamask,
  Wallet.OkxWallet,
  Wallet.TrustWallet
] as WalletType[]

const cosmosWalletsWithValidation = [
  Wallet.Leap,
  Wallet.Keplr,
  Wallet.Ninji,
  Wallet.OWallet,
  Wallet.Cosmostation
] as WalletType[]

type WalletStoreState = {
  wallet: Wallet
  email?: string
  address: string
  session: string
  privateKey: string
  autoSign?: AutoSign
  addresses: string[]
  isReadOnly: boolean // used to "impersonate" a wallet in a read-only mode
  hwAddresses: string[]
  leapInstalled: boolean
  queueStatus: StatusType
  rabbyInstalled: boolean

  // Cosmos wallets
  keplrInstalled: boolean
  ninjiInstalled: boolean
  injectiveAddress: string
  bitGetInstalled: boolean
  rainbowInstalled: boolean
  phantomInstalled: boolean
  owalletInstalled: boolean
  keplrEvmInstalled: boolean
  metamaskInstalled: boolean
  addressConfirmation: string
  okxWalletInstalled: boolean

  trustWalletInstalled: boolean
  isFeeDelegationEnabled: boolean
  turnkeyInjectiveAddress: string
  walletConnectStatus: WalletConnectStatus

  hwAddressesInfo: {
    address: string
    derivationPath: string
    baseDerivationPath: string
  }[]

  authZ: {
    address: string
    injectiveAddress: string
    direction: GrantDirection
    defaultSubaccountId: string
  }

  hwAddressInfo:
    | undefined
    | {
        address: string
        derivationPath: string
        baseDerivationPath: string
      }
}

const initialStateFactory = (): WalletStoreState => ({
  email: '',
  address: '',
  session: '',
  addresses: [],
  privateKey: '',
  hwAddresses: [],
  isReadOnly: false,
  injectiveAddress: '',
  bitGetInstalled: false,
  addressConfirmation: '',
  wallet: Wallet.Metamask,
  rabbyInstalled: false,
  rainbowInstalled: false,
  phantomInstalled: false,
  keplrEvmInstalled: false,
  metamaskInstalled: false,
  okxWalletInstalled: false,
  trustWalletInstalled: false,
  isFeeDelegationEnabled: true,
  turnkeyInjectiveAddress: '',
  queueStatus: StatusType.Idle,

  // Cosmos wallets
  keplrInstalled: false,
  leapInstalled: false,
  ninjiInstalled: false,
  owalletInstalled: false,

  hwAddressInfo: undefined,
  hwAddressesInfo: [],

  walletConnectStatus: WalletConnectStatus.idle,

  autoSign: {
    duration: 0,
    expiration: 0,
    version: 0,
    publicKey: '',
    privateKey: '',
    storageKey: '',
    isConfirmed: false,
    isDeterministic: true,
    injectiveAddress: ''
  },

  authZ: {
    address: '',
    injectiveAddress: '',
    defaultSubaccountId: '',
    direction: GrantDirection.Granter
  }
})

export const useSharedWalletStore = defineStore('sharedWallet', {
  state: (): WalletStoreState => initialStateFactory(),
  getters: {
    authZOrAddress: (state) => {
      return state.authZ.address || state.address
    },

    isSSOAuth: (state) => {
      return ([Wallet.Magic, Wallet.Turnkey] as Wallet[]).includes(state.wallet)
    },

    isWalletExemptFromGasFee: (state) => {
      return !isCosmosWallet(state.wallet) && !IS_DEVNET
    },

    authZOrInjectiveAddress: (state) => {
      return state.authZ.injectiveAddress || state.injectiveAddress
    },

    defaultSubaccountId: (state) => {
      if (!state.injectiveAddress) {
        return undefined
      }

      return getDefaultSubaccountId(state.injectiveAddress)
    },

    authZOrDefaultSubaccountId: (state) => {
      return (
        state.authZ.defaultSubaccountId ||
        (state.injectiveAddress &&
          getDefaultSubaccountId(state.injectiveAddress)) ||
        ''
      )
    },

    isAutoSignEnabled: (state) => {
      if (!state.autoSign) {
        return false
      }

      if (!state.autoSign.injectiveAddress) {
        return false
      }

      if (state.autoSign.isDeterministic) {
        if (!state.autoSign.storageKey || !state.autoSign.isConfirmed) {
          return false
        }
      } else if (!state.autoSign.privateKey) {
        return false
      }

      if (!state.autoSign.expiration || !state.autoSign.duration) {
        return false
      }

      const nowInSeconds = Math.floor(Date.now() / 1000)

      if (state.autoSign.expiration <= nowInSeconds) {
        return false
      }

      return true
    },

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
    }
  },
  actions: {
    // Lazy-loaded extension checks
    checkIsBitGetInstalled: lazyPiniaAction(
      () => import('./extensions'),
      'checkIsBitGetInstalled'
    ),
    checkIsRainbowInstalled: lazyPiniaAction(
      () => import('./extensions'),
      'checkIsRainbowInstalled'
    ),
    checkIsMetamaskInstalled: lazyPiniaAction(
      () => import('./extensions'),
      'checkIsMetamaskInstalled'
    ),
    checkIsKeplrEvmInstalled: lazyPiniaAction(
      () => import('./extensions'),
      'checkIsKeplrEvmInstalled'
    ),
    checkIsOkxWalletInstalled: lazyPiniaAction(
      () => import('./extensions'),
      'checkIsOkxWalletInstalled'
    ),
    checkIsTrustWalletInstalled: lazyPiniaAction(
      () => import('./extensions'),
      'checkIsTrustWalletInstalled'
    ),
    checkIsRabbyWalletInstalled: lazyPiniaAction(
      () => import('./extensions'),
      'checkIsRabbyWalletInstalled'
    ),
    checkIsPhantomWalletInstalled: lazyPiniaAction(
      () => import('./extensions'),
      'checkIsPhantomWalletInstalled'
    ),

    // Lazy-loaded cosmos wallet extension checks
    checkIsKeplrInstalled: lazyPiniaAction(
      () => import('./extensions'),
      'checkIsKeplrInstalled'
    ),
    checkIsLeapInstalled: lazyPiniaAction(
      () => import('./extensions'),
      'checkIsLeapInstalled'
    ),
    checkIsNinjiInstalled: lazyPiniaAction(
      () => import('./extensions'),
      'checkIsNinjiInstalled'
    ),
    checkIsOwalletInstalled: lazyPiniaAction(
      () => import('./extensions'),
      'checkIsOwalletInstalled'
    ),

    // Lazy-loaded magic wallet actions
    connectMagic: lazyPiniaAction(() => import('./magic'), 'connectMagic'),
    queryMagicExistingUser: lazyPiniaAction(
      () => import('./magic'),
      'queryMagicExistingUser'
    ),

    // Lazy-loaded turnkey wallet actions
    submitTurnkeyOTP: lazyPiniaAction(
      () => import('./turnkey'),
      'submitTurnkeyOTP'
    ),
    initTurnkeyGoogle: lazyPiniaAction(
      () => import('./turnkey'),
      'initTurnkeyGoogle'
    ),
    getEmailTurnkeyOTP: lazyPiniaAction(
      () => import('./turnkey'),
      'getEmailTurnkeyOTP'
    ),
    connectTurnkeyGoogle: lazyPiniaAction(
      () => import('./turnkey'),
      'connectTurnkeyGoogle'
    ),

    async validateAndQueue() {
      const sharedWalletStore = useSharedWalletStore()

      await sharedWalletStore.validateBeforeQueue()

      sharedWalletStore.queue()
    },

    async disconnectAutoSign() {
      const walletStore = useSharedWalletStore()
      const autoSignWalletStrategy = await getAutoSignWalletStrategy()
      const storageKey = walletStore.autoSign?.storageKey

      if (storageKey) {
        await clearAutoSignKey(storageKey)
      }

      walletStore.$patch({
        autoSign: undefined
      })

      await autoSignWalletStrategy.disconnect()
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

    resetAuthZ() {
      const walletStore = useSharedWalletStore()

      walletStore.$patch({
        authZ: {
          address: '',
          injectiveAddress: '',
          defaultSubaccountId: '',
          direction: GrantDirection.Granter
        }
      })

      walletStore.onConnect()
    },

    queue() {
      const walletStore = useSharedWalletStore()

      if (walletStore.queueStatus === StatusType.Loading) {
        throw new GeneralException(new Error('You have a pending transaction.'))
      }

      walletStore.$patch({
        queueStatus: StatusType.Loading
      })
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

      walletStore.onConnect()
    },

    async init() {
      const walletStore = useSharedWalletStore()
      const walletStrategy = await getWalletStrategy()

      walletStore.walletConnectStatus = WalletConnectStatus.idle

      await walletStrategy.setWallet(walletStore.wallet)

      if (walletStore.hwAddressInfo) {
        walletStrategy.setMetadata({
          derivationPath: walletStore.hwAddressInfo.derivationPath
        })
      }

      if (
        walletStore.wallet === Wallet.Magic &&
        (!walletStore.isUserConnected || walletStore.turnkeyInjectiveAddress)
      ) {
        await walletStore.connectMagic()
      }

      if (
        walletStore.isUserConnected &&
        walletStore.wallet === Wallet.Turnkey
      ) {
        // refresh session
        await walletStrategy.getSessionOrConfirm()
      }

      if (walletStore.autoSign?.privateKey) {
        const autoSignWalletStrategy = await getAutoSignWalletStrategy()

        await autoSignWalletStrategy.setMetadata({
          privateKey: {
            privateKey: walletStore.autoSign.privateKey as string
          }
        })
      }

      if (walletStore.privateKey) {
        walletStore.connectWallet(Wallet.PrivateKey, {
          privateKey: walletStore.privateKey
        })
      }
    },

    async validateBeforeQueue() {
      const walletStore = useSharedWalletStore()

      if (walletStore.isAutoSignEnabled) {
        return
      }

      await walletStore.validateMainWallet()
    },

    async validateMainWallet() {
      const walletStore = useSharedWalletStore()

      if (evmWalletsWithValidation.includes(walletStore.wallet)) {
        await validateEvmWallet({
          wallet: walletStore.wallet,
          address: walletStore.address
        })

        return
      }

      if (cosmosWalletsWithValidation.includes(walletStore.wallet)) {
        await validateCosmosWallet({
          wallet: walletStore.wallet,
          address: walletStore.injectiveAddress
        })
      }
    },

    async connectWallet(wallet: Wallet, options?: { privateKey: string }) {
      const walletStore = useSharedWalletStore()
      const walletStrategy = await getWalletStrategy()

      /**
       * We should disconnect only if there are no hardware wallets connected
       * and we still haven't fetched any addresses and we've already connected
       * so there is no need to disconnect
       */
      if (walletStore.hwAddresses.length === 0) {
        await walletStrategy.disconnect()
      }

      if (
        (
          [
            Wallet.Ledger,
            Wallet.TrezorBip32,
            Wallet.TrezorBip44,
            Wallet.LedgerCosmos
          ] as Wallet[]
        ).includes(wallet)
      ) {
        walletStrategy.setMetadata({
          derivationPath: undefined
        })
      }

      await walletStrategy.setWallet(wallet)

      if (options?.privateKey) {
        await walletStrategy.setMetadata({
          privateKey: {
            privateKey: options.privateKey
          }
        })
      }

      walletStore.$patch({
        wallet
      })

      if (wallet !== Wallet.PrivateKey) {
        walletStore.$patch({
          walletConnectStatus: WalletConnectStatus.connecting
        })
      }
    },

    async logout() {
      const walletStore = useSharedWalletStore()
      const walletStrategy = await getWalletStrategy()
      const storageKey = walletStore.autoSign?.storageKey

      walletStore.walletConnectStatus = WalletConnectStatus.disconnecting

      await walletStrategy.disconnect()

      if (storageKey) {
        await clearAutoSignKey(storageKey)
      }

      walletStrategy.setMetadata({
        ...walletStrategy.metadata,
        derivationPath: undefined
      })

      walletStore.$patch({
        ...initialStateFactory(),
        autoSign: undefined,
        turnkeyInjectiveAddress: '',
        queueStatus: StatusType.Idle,
        leapInstalled: walletStore.leapInstalled,
        ninjiInstalled: walletStore.ninjiInstalled,
        rabbyInstalled: walletStore.rabbyInstalled,
        keplrInstalled: walletStore.keplrInstalled,
        bitGetInstalled: walletStore.bitGetInstalled,
        owalletInstalled: walletStore.owalletInstalled,
        rainbowInstalled: walletStore.rainbowInstalled,
        phantomInstalled: walletStore.phantomInstalled,
        keplrEvmInstalled: walletStore.keplrEvmInstalled,
        metamaskInstalled: walletStore.metamaskInstalled,
        okxWalletInstalled: walletStore.okxWalletInstalled,
        walletConnectStatus: WalletConnectStatus.disconnected,
        trustWalletInstalled: walletStore.trustWalletInstalled,
        isFeeDelegationEnabled: walletStore.isFeeDelegationEnabled,
        authZ: {
          address: '',
          injectiveAddress: '',
          defaultSubaccountId: '',
          direction: GrantDirection.Granter
        },
        hwAddresses: [],
        hwAddressesInfo: [],
        hwAddressInfo: undefined
      })

      useEventBus(EventBus.WalletDisconnected).emit()
    },

    async getHWAddresses(wallet: Wallet) {
      const walletStore = useSharedWalletStore()
      const walletStrategy = await getWalletStrategy()

      if (
        walletStore.hwAddresses.length === 0 ||
        walletStore.wallet !== wallet
      ) {
        await walletStrategy.disconnect()
        await walletStrategy.setWallet(wallet)

        walletStore.$patch({
          wallet
        })

        const addresses = await getAddresses()

        const injectiveAddresses = isEvmWallet(wallet)
          ? addresses.map(getInjectiveAddress)
          : addresses

        walletStore.$patch({
          hwAddresses: injectiveAddresses
        })
      } else {
        const addresses = await getAddresses()
        const injectiveAddresses = isEvmWallet(wallet)
          ? addresses.map(getInjectiveAddress)
          : addresses

        walletStore.$patch({
          hwAddresses: [...walletStore.hwAddresses, ...injectiveAddresses]
        })
      }
    },

    async getHWAddressesInfo(wallet: Wallet) {
      const walletStore = useSharedWalletStore()
      const walletStrategy = await getWalletStrategy()

      if (
        walletStore.hwAddressesInfo.length === 0 ||
        walletStore.wallet !== wallet
      ) {
        await walletStrategy.disconnect()
        await walletStrategy.setWallet(wallet)

        walletStore.$patch({
          wallet
        })

        const addresses = await getHwAddressesInfo()

        const injectiveAddresses = isEvmWallet(wallet)
          ? addresses.map((info) => ({
              ...info,
              address: getInjectiveAddress(info.address)
            }))
          : addresses

        walletStore.$patch({
          hwAddressesInfo: injectiveAddresses
        })
      } else {
        const addresses = await getHwAddressesInfo()

        const injectiveAddresses = isEvmWallet(wallet)
          ? addresses.map((info) => ({
              ...info,
              address: getInjectiveAddress(info.address)
            }))
          : addresses

        walletStore.$patch({
          hwAddressesInfo: [
            ...walletStore.hwAddressesInfo,
            ...injectiveAddresses
          ]
        })
      }
    },

    /**
     * This method disregards the authz, autosign and broadcasts from the main connected wallet
     * with or without fee delegation, depending on whether fee delegation is enabled or not
     */
    async broadcastFromMainWallet(messages: Msgs | Msgs[], memo?: string) {
      const walletStore = useSharedWalletStore()

      if (walletStore.isReadOnly) {
        throw new GeneralException(
          new Error(
            'Read-only connection cannot sign or submit transactions. Connect a wallet to continue.'
          )
        )
      }

      if (!walletStore.isUserConnected) {
        throw new GeneralException(new Error('Wallet is not connected'))
      }

      await walletStore.validateMainWallet()

      const actualMessages = normalizeBroadcastMessages(messages)

      const broadcastOptions = {
        memo,
        msgs: actualMessages,
        injectiveAddress: walletStore.injectiveAddress
      }

      if (walletStore.isFeeDelegationEnabled) {
        const msgBroadcaster = await getMsgBroadcaster()

        const response =
          await msgBroadcaster.broadcastWithFeeDelegation(broadcastOptions)

        useEventBus(EventBus.BroadcastResponse).emit(response)

        return response
      }

      const msgBroadcaster = await getMsgBroadcaster()

      const response = await msgBroadcaster.broadcastV2(broadcastOptions)

      useEventBus(EventBus.BroadcastResponse).emit(response)

      return response
    },

    /**
     * This is an abstraction method that handles the broadcast of transactions with regards of:
     * - autoz status
     * - autosign status,
     * - fee delegation status
     */
    async broadcast(messages: Msgs | Msgs[], memo?: string) {
      const walletStore = useSharedWalletStore()

      if (walletStore.isReadOnly) {
        throw new GeneralException(
          new Error(
            'Read-only connection cannot sign or submit transactions. Connect a wallet to continue.'
          )
        )
      }

      if (!walletStore.isUserConnected) {
        throw new GeneralException(new Error('Wallet is not connected'))
      }

      if (walletStore.isAutoSignEnabled && walletStore.isAuthzWalletConnected) {
        throw new GeneralException(
          new Error('Authz and auto-sign cannot be used together')
        )
      }

      const normalizedMessages = normalizeBroadcastMessages(messages)

      // Check authorization on RAW messages BEFORE MsgExec wrapping.
      // Authorized (all trading msgs) → wrap in MsgExec + dispatch to autoSign broadcaster directly.
      // Unauthorized (CW20, mixed, non-trading) → fall through to main wallet with raw messages.
      const nowInSeconds = Math.floor(Date.now() / 1000)
      const isAutoSignActive =
        walletStore.autoSign &&
        walletStore.isAutoSignEnabled &&
        (walletStore.autoSign.expiration || 0) > nowInSeconds

      if (isAutoSignActive && !walletStore.isSSOAuth) {
        const isUnauthorizedMessages =
          checkUnauthorizedMessages(normalizedMessages)

        if (!isUnauthorizedMessages) {
          const autoSign = walletStore.autoSign as AutoSign
          const autoSignMsgBroadcaster = await getAutoSignMsgBroadcaster()
          const autoSignMessages = msgsOrMsgExecMsgs(
            normalizedMessages,
            autoSign.injectiveAddress
          )
          const autoSignOptions = {
            memo,
            msgs: autoSignMessages,
            injectiveAddress: autoSign.injectiveAddress
          }

          const response = await withAutoSignPrivateKey(autoSign, async () =>
            walletStore.isFeeDelegationEnabled
              ? await autoSignMsgBroadcaster.broadcastWithFeeDelegation(
                  autoSignOptions
                )
              : await autoSignMsgBroadcaster.broadcastV2(autoSignOptions)
          )

          useEventBus(EventBus.BroadcastResponse).emit(response)

          return response
        }
      }

      // AuthZ or regular path (autoSign not active, or messages unauthorized for autoSign)
      const actualMessages = walletStore.isAuthzWalletConnected
        ? msgsOrMsgExecMsgs(normalizedMessages, walletStore.injectiveAddress)
        : normalizedMessages

      const broadcastOptions = {
        memo,
        msgs: actualMessages,
        injectiveAddress: walletStore.injectiveAddress
      }

      if (walletStore.isFeeDelegationEnabled) {
        return await this.broadcastWithFeeDelegation(broadcastOptions)
      }

      return await this.broadcastWithoutFeeDelegation(broadcastOptions)
    },

    async broadcastWithoutFeeDelegation(
      broadcastOptions: MsgBroadcasterTxOptions
    ) {
      const walletStore = useSharedWalletStore()

      if (walletStore.isFeeDelegationEnabled) {
        throw new GeneralException(
          new Error(
            'Broadcasting is not available for fee delegation, use broadcastWithFeeDelegation instead'
          )
        )
      }

      const isAutoSignEnabled =
        walletStore.autoSign &&
        walletStore.isAutoSignEnabled &&
        (walletStore.autoSign.expiration || 0) > Math.floor(Date.now() / 1000)

      if (isAutoSignEnabled && !walletStore.isSSOAuth) {
        const isUnauthorizedMessages = checkUnauthorizedMessages(
          normalizeBroadcastMessages(broadcastOptions.msgs)
        )

        if (!isUnauthorizedMessages) {
          const autoSignMsgBroadcaster = await getAutoSignMsgBroadcaster()
          const autoSign = walletStore.autoSign as AutoSign

          const response = await withAutoSignPrivateKey(
            autoSign,
            async () =>
              await autoSignMsgBroadcaster.broadcastV2({
                memo: broadcastOptions.memo,
                msgs: msgsOrMsgExecMsgs(
                  normalizeBroadcastMessages(broadcastOptions.msgs),
                  autoSign.injectiveAddress
                ),
                injectiveAddress: autoSign.injectiveAddress
              })
          )

          useEventBus(EventBus.BroadcastResponse).emit(response)

          return response
        }
      }

      const msgBroadcaster = await getMsgBroadcaster()

      const response = await msgBroadcaster.broadcastV2(broadcastOptions)

      useEventBus(EventBus.BroadcastResponse).emit(response)

      return response
    },

    async broadcastWithFeeDelegation(
      broadcastOptions: MsgBroadcasterTxOptions
    ) {
      const walletStore = useSharedWalletStore()

      if (!walletStore.isFeeDelegationEnabled) {
        throw new GeneralException(
          new Error(
            'Broadcasting is not available for fee delegation, use broadcastWithoutFeeDelegation instead'
          )
        )
      }

      const isAutoSignEnabled =
        walletStore.autoSign &&
        walletStore.isAutoSignEnabled &&
        (walletStore.autoSign.expiration || 0) > Math.floor(Date.now() / 1000)

      if (isAutoSignEnabled && !walletStore.isSSOAuth) {
        const isUnauthorizedMessages = checkUnauthorizedMessages(
          normalizeBroadcastMessages(broadcastOptions.msgs)
        )

        if (!isUnauthorizedMessages) {
          const autoSignMsgBroadcaster = await getAutoSignMsgBroadcaster()
          const autoSign = walletStore.autoSign as AutoSign

          const response = await withAutoSignPrivateKey(
            autoSign,
            async () =>
              await autoSignMsgBroadcaster.broadcastWithFeeDelegation({
                memo: broadcastOptions.memo,
                msgs: msgsOrMsgExecMsgs(
                  normalizeBroadcastMessages(broadcastOptions.msgs),
                  autoSign.injectiveAddress
                ),
                injectiveAddress: autoSign.injectiveAddress
              })
          )

          useEventBus(EventBus.BroadcastResponse).emit(response)

          return response
        }
      }

      const msgBroadcaster = await getMsgBroadcaster()

      const response =
        await msgBroadcaster.broadcastWithFeeDelegation(broadcastOptions)

      useEventBus(EventBus.BroadcastResponse).emit(response)

      return response
    },

    async validateAutoSign({
      msgsType = [],
      contractMsgTypeMap,
      existingGrants = [],
      contractExecutionCompatAuthz = []
    }: {
      msgsType: string[]
      contractMsgTypeMap?: Record<string, string[]>
      existingGrants: GrantAuthorizationWithDecodedAuthorization[]
      contractExecutionCompatAuthz: ContractExecutionCompatAuthz[]
    }) {
      if (
        msgsType.length === 0 &&
        contractExecutionCompatAuthz.length === 0 &&
        existingGrants.length === 0
      ) {
        throw new GeneralException(new Error('No messages provided'))
      }

      const walletStore = useSharedWalletStore()

      if (!walletStore.isAutoSignEnabled) {
        return
      }

      const autoSign = walletStore.autoSign as AutoSign
      const nowInSeconds = Math.floor(Date.now() / 1000)

      const grants =
        existingGrants.length > 0
          ? existingGrants
          : await fetchGranterGrantsNoThrow(walletStore.injectiveAddress)

      const hasValidAutoSignExpiration =
        autoSign.expiration > nowInSeconds + AUTO_SIGN_RENEWAL_THRESHOLD

      const hasMissingOrExpiringAuthz = hasMissingOrExpiringGrants({
        grants,
        messageTypes: msgsType,
        grantee: autoSign.injectiveAddress,
        granter: walletStore.injectiveAddress
      })

      // Extract contract grant targets directly — getAutoSignGrantConfig is not
      // used here because it throws when all three inputs are empty, which is a
      // valid scenario when only existingGrants is provided.
      const contractEntries = Object.entries(contractMsgTypeMap || {}).map(
        ([contractAddress, contractMsgsType]) => ({
          contractAddress,
          contractMsgsType
        })
      )

      const hasMissingOrExpiringContractAuthz = contractEntries.some(
        ({ contractAddress, contractMsgsType }) =>
          contractMsgsType.length > 0 &&
          hasMissingOrExpiringGrants({
            grants,
            messageTypes: contractMsgsType,
            grantee: contractAddress,
            granter: walletStore.injectiveAddress
          })
      )

      if (
        hasValidAutoSignExpiration &&
        !hasMissingOrExpiringAuthz &&
        !hasMissingOrExpiringContractAuthz &&
        contractExecutionCompatAuthz.length === 0
      ) {
        return
      }

      const expiryInSeconds = autoSign.duration || AUTO_SIGN_GRANT_DURATION
      const renewedExpiration = nowInSeconds + expiryInSeconds

      const grantWithAuthorization = (contractExecutionCompatAuthz || []).map(
        (authorization) =>
          MsgGrantWithAuthorization.fromJSON({
            authorization,
            grantee: autoSign.injectiveAddress,
            granter: walletStore.injectiveAddress,
            expiryInSeconds
          })
      )
      const authZMsgs = getMissingGrantMessages({
        grants,
        messageTypes: msgsType,
        expiryInSeconds,
        grantee: autoSign.injectiveAddress,
        granter: walletStore.injectiveAddress
      })
      const contractMsgs = contractEntries.flatMap(
        ({ contractAddress, contractMsgsType }) =>
          contractMsgsType.length > 0
            ? getMissingGrantMessages({
                grants,
                messageTypes: contractMsgsType,
                expiryInSeconds,
                grantee: contractAddress,
                granter: walletStore.injectiveAddress
              })
            : []
      )
      const messages = [
        ...authZMsgs,
        ...contractMsgs,
        ...grantWithAuthorization
      ]
      const expiration = getAutoSignGrantExpiration({
        grants,
        messageTypes: msgsType,
        contractEntries,
        granter: walletStore.injectiveAddress,
        renewedExpiration: messages.length > 0 ? renewedExpiration : undefined,
        grantee: autoSign.injectiveAddress
      })

      const actualAutoSign = {
        ...autoSign,
        expiration
      }

      if (messages.length === 0) {
        walletStore.$patch({
          autoSign: actualAutoSign
        })

        return actualAutoSign
      }

      // we have to submit this transaction from the main wallet
      await this.broadcastFromMainWallet(messages)

      walletStore.$patch({
        autoSign: actualAutoSign
      })

      return actualAutoSign
    },

    async connectDeterministicAutoSign() {
      const walletStore = useSharedWalletStore()

      const walletStrategy = await getWalletStrategy()

      const signer = isCosmosWallet(walletStore.wallet)
        ? walletStore.injectiveAddress
        : walletStore.address
      const payload = getAutoSignPayload(walletStore.injectiveAddress)

      const signature = walletStore.isSSOAuth
        ? await walletStrategy.signEip712TypedData(
            JSON.stringify({
              types: {
                EIP712Domain: [{ name: 'name', type: 'string' }],
                AutoSign: [{ name: 'message', type: 'string' }]
              },
              primaryType: 'AutoSign',
              message: { message: payload },
              domain: { name: IS_TRUE_CURRENT ? 'TrueCurrent' : 'Injective' }
            }),
            walletStore.address
          )
        : await walletStrategy.signArbitrary(signer, payload)

      if (!signature) {
        throw new GeneralException(new Error('Unable to sign autosign payload'))
      }

      const autoSignKey = await deriveAndStoreAutoSignKey({
        signature,
        address: walletStore.address,
        injectiveAddress: walletStore.injectiveAddress
      })

      return {
        ...autoSignKey,
        duration: 0,
        expiration: 0,
        isConfirmed: true
      }
    },

    async authorizeDeterministicAutoSign({
      autoSign,
      msgsType,
      existingGrants = [],
      contractMsgTypeMap,
      contractExecutionCompatAuthz
    }: ConnectAutoSignOptions) {
      const walletStore = useSharedWalletStore()

      if (!autoSign) {
        throw new GeneralException(new Error('Auto sign is not connected'))
      }

      const actualAutoSign = { ...autoSign } as AutoSign

      const { contractEntries } = getAutoSignGrantConfig({
        msgsType,
        contractMsgTypeMap,
        contractExecutionCompatAuthz
      })
      const nowInSeconds = Math.floor(Date.now() / 1000)
      const duration = AUTO_SIGN_GRANT_DURATION
      const expiration = nowInSeconds + duration

      const grants =
        existingGrants.length > 0
          ? existingGrants
          : await fetchGranterGrantsNoThrow(walletStore.injectiveAddress)
      const grantWithAuthorization = (contractExecutionCompatAuthz || []).map(
        (authorization) =>
          MsgGrantWithAuthorization.fromJSON({
            authorization,
            expiryInSeconds: duration,
            grantee: actualAutoSign.injectiveAddress,
            granter: walletStore.injectiveAddress
          })
      )
      const authZMsgs = getMissingGrantMessages({
        grants,
        messageTypes: msgsType || [],
        grantee: actualAutoSign.injectiveAddress,
        expiryInSeconds: duration,
        granter: walletStore.injectiveAddress
      })
      const contractMsgs = contractEntries.flatMap(
        ({ contractAddress, contractMsgsType }) =>
          getMissingGrantMessages({
            grants,
            grantee: contractAddress,
            messageTypes: contractMsgsType,
            expiryInSeconds: duration,
            granter: walletStore.injectiveAddress
          })
      )
      const messages = [
        ...authZMsgs,
        ...contractMsgs,
        ...grantWithAuthorization
      ]

      if (messages.length === 0) {
        const existingExpiration = getAutoSignGrantExpiration({
          grants,
          granter: walletStore.injectiveAddress,
          grantee: actualAutoSign.injectiveAddress,
          messageTypes: msgsType || [],
          contractEntries
        })

        return {
          ...actualAutoSign,
          duration: actualAutoSign.duration || duration,
          expiration: existingExpiration || expiration
        }
      }

      try {
        // we have to submit this transaction from the main wallet
        await this.broadcastFromMainWallet(messages)

        const actualExpiration = getAutoSignGrantExpiration({
          grants,
          granter: walletStore.injectiveAddress,
          grantee: actualAutoSign.injectiveAddress,
          messageTypes: msgsType || [],
          contractEntries,
          renewedExpiration: expiration
        })

        return {
          ...actualAutoSign,
          duration,
          expiration: actualExpiration
        }
      } catch (error) {
        if (actualAutoSign.storageKey) {
          await clearAutoSignKey(actualAutoSign.storageKey)
        }

        throw error
      }
    },

    /**
     * @deprecated Legacy simple autoSign flow. Prefer deterministic autoSign.
     * This creates a fresh private key on each reconnect, so authorization also
     * grants a fresh grantee address instead of reusing existing grants.
     */
    async connectAutoSign() {
      const { privateKey } = PrivateKey.generate()
      const injectiveAddress = privateKey.toBech32()

      const autoSign = {
        duration: 0,
        expiration: 0,
        injectiveAddress,
        privateKey: privateKey.toPrivateKeyHex()
      }

      return autoSign
    },

    /**
     * @deprecated Legacy simple autoSign authorization. Prefer deterministic
     * autoSign. Since the simple flow grants a newly generated private key on
     * each reconnect, there are no existing grants to fetch or pass in. In comparison with the
     * deterministic autoSign flow reuses the same grantee address, so existing
     * grants can already exist and must be considered there.
     */
    async authorizeAutoSign({
      autoSign,
      msgsType,
      contractMsgTypeMap,
      contractExecutionCompatAuthz
    }: ConnectAutoSignOptions) {
      const walletStore = useSharedWalletStore()

      const actualAutoSign = { ...autoSign } as AutoSign

      if (!actualAutoSign) {
        throw new GeneralException(new Error('Auto sign is not connected'))
      }

      const { contractEntries } = getAutoSignGrantConfig({
        msgsType,
        contractMsgTypeMap,
        contractExecutionCompatAuthz
      })

      const nowInSeconds = Math.floor(Date.now() / 1000)
      const expirationInSeconds = 60 * 60 * 24 * 30 // 30 days

      const grantWithAuthorization = (contractExecutionCompatAuthz || []).map(
        (authorization) =>
          MsgGrantWithAuthorization.fromJSON({
            authorization,
            grantee: actualAutoSign.injectiveAddress,
            granter: walletStore.injectiveAddress,
            expiration: nowInSeconds + expirationInSeconds
          })
      )

      const authZMsgs = (msgsType || []).map((messageType) =>
        MsgGrant.fromJSON({
          grantee: actualAutoSign.injectiveAddress,
          granter: walletStore.injectiveAddress,
          expiration: nowInSeconds + expirationInSeconds,
          authorization: getGenericAuthorizationFromMessageType(messageType)
        })
      )

      const contractMsgs = contractEntries.flatMap(
        ({ contractAddress, contractMsgsType }) =>
          contractMsgsType.map((messageType) =>
            MsgGrant.fromJSON({
              grantee: contractAddress,
              granter: walletStore.injectiveAddress,
              expiration: nowInSeconds + expirationInSeconds,
              authorization: getGenericAuthorizationFromMessageType(messageType)
            })
          )
      )

      // we have to submit this transaction from the main wallet
      await this.broadcastFromMainWallet([
        ...authZMsgs,
        ...contractMsgs,
        ...grantWithAuthorization
      ])

      const autoSignWalletStrategy = await getAutoSignWalletStrategy()

      await autoSignWalletStrategy.setMetadata({
        privateKey: {
          privateKey: actualAutoSign.privateKey as string
        }
      })

      return {
        ...actualAutoSign,
        duration: expirationInSeconds,
        expiration: nowInSeconds + expirationInSeconds
      }
    },

    async fetchWeb3GatewayStatus() {
      const walletStore = useSharedWalletStore()

      const status = await web3GatewayService.healthCheck()

      walletStore.$patch({
        isFeeDelegationEnabled: status
      })
    },

    async connectTrustWallet() {
      const walletStore = useSharedWalletStore()
      const walletStrategy = await getWalletStrategy()

      await walletStore.connectWallet(Wallet.TrustWallet)

      const addresses = await getAddresses()
      const [address] = addresses
      const session = await walletStrategy.getSessionOrConfirm(address)

      walletStore.$patch({
        address,
        session,
        addresses,
        injectiveAddress: getInjectiveAddress(address || ''),
        addressConfirmation: await walletStrategy.getSessionOrConfirm(address)
      })

      await walletStore.onConnect()
    },

    async connectWalletConnect() {
      const walletStore = useSharedWalletStore()
      const walletStrategy = await getWalletStrategy()

      await walletStore.connectWallet(Wallet.WalletConnect)

      const addresses = await getAddresses()

      const [address] = addresses
      const session = await walletStrategy.getSessionOrConfirm(address)

      walletStore.$patch({
        address,
        session,
        addresses,
        injectiveAddress: getInjectiveAddress(address || ''),
        addressConfirmation: await walletStrategy.getSessionOrConfirm(address)
      })

      await walletStore.onConnect()
    },

    async connectEvmWallet(wallet: Wallet) {
      const walletStore = useSharedWalletStore()
      const walletStrategy = await getWalletStrategy()

      await walletStore.connectWallet(wallet)

      const addresses = await getAddresses()
      const [address] = addresses
      const session = await walletStrategy.getSessionOrConfirm(address)

      walletStore.$patch({
        address,
        session,
        addresses,
        injectiveAddress: getInjectiveAddress(address || ''),
        addressConfirmation: await walletStrategy.getSessionOrConfirm(address)
      })

      await walletStore.onConnect()
    },

    async connectCosmosWallet(wallet: Wallet) {
      const walletStore = useSharedWalletStore()
      const walletStrategy = await getWalletStrategy()

      await walletStore.connectWallet(wallet)

      const injectiveAddresses = await getAddresses()
      const [injectiveAddress] = injectiveAddresses
      const session = await walletStrategy.getSessionOrConfirm()

      await confirmCosmosWalletAddress(wallet, injectiveAddress || '')

      walletStore.$patch({
        session,
        injectiveAddress,
        addresses: injectiveAddresses,
        address: getEthereumAddress(injectiveAddress || ''),
        addressConfirmation:
          await walletStrategy.getSessionOrConfirm(injectiveAddress)
      })

      await walletStore.onConnect()
    },

    async connectLedger({
      wallet,
      address,
      derivationPath
    }: {
      wallet: Wallet
      address: string
      derivationPath?: string
    }) {
      const walletStore = useSharedWalletStore()
      const walletStrategy = await getWalletStrategy()

      await walletStore.connectWallet(wallet)
      walletStrategy.setMetadata({ derivationPath })

      const ethereumAddress = getEthereumAddress(address)
      const session = await walletStrategy.getSessionOrConfirm(ethereumAddress)

      walletStore.$patch({
        session,
        address: ethereumAddress,
        injectiveAddress: address,
        addresses: [ethereumAddress],
        addressConfirmation:
          await walletStrategy.getSessionOrConfirm(ethereumAddress),

        hwAddressInfo: {
          address: ethereumAddress,
          derivationPath: derivationPath || '',
          baseDerivationPath: ''
        }
      })

      await walletStore.onConnect()
    },

    async connectTrezor({
      wallet,
      address,
      derivationPath
    }: {
      wallet: Wallet
      address: string
      derivationPath?: string
    }) {
      const walletStore = useSharedWalletStore()
      const walletStrategy = await getWalletStrategy()

      await walletStore.connectWallet(wallet)
      walletStrategy.setMetadata({ derivationPath })

      const ethereumAddress = getEthereumAddress(address)
      const session = await walletStrategy.getSessionOrConfirm(ethereumAddress)

      walletStore.$patch({
        session,
        address: ethereumAddress,
        injectiveAddress: address,
        addresses: [ethereumAddress],
        addressConfirmation:
          await walletStrategy.getSessionOrConfirm(ethereumAddress),
        hwAddressInfo: {
          address: ethereumAddress,
          derivationPath: derivationPath || '',
          baseDerivationPath: ''
        }
      })

      await walletStore.onConnect()
    },

    async connectPrivateKey(privateKeyHash: string) {
      const walletStore = useSharedWalletStore()
      const walletStrategy = await getWalletStrategy()

      const pk = PrivateKey.fromHex(privateKeyHash)
      const injectiveAddress = pk.toBech32()

      await walletStore.connectWallet(Wallet.PrivateKey, {
        privateKey: privateKeyHash
      })

      const address = getEthereumAddress(injectiveAddress)
      const session = await walletStrategy.getSessionOrConfirm(address)

      walletStore.$patch({
        address,
        session,
        injectiveAddress,
        addresses: [address],
        wallet: Wallet.PrivateKey,
        privateKey: privateKeyHash,
        addressConfirmation: await walletStrategy.getSessionOrConfirm(address)
      })

      await walletStore.onConnect()
    },

    async connectReadOnlyAddress(injectiveAddress: string) {
      const walletStore = useSharedWalletStore()
      const walletStrategy = await getWalletStrategy()

      await walletStore.connectWallet(Wallet.Metamask)

      const addresses = [getEthereumAddress(injectiveAddress)]
      const [address] = addresses
      const session = await walletStrategy.getSessionOrConfirm(address)

      walletStore.$patch({
        address,
        session,
        addresses,
        isReadOnly: true,
        injectiveAddress,
        addressConfirmation: await walletStrategy.getSessionOrConfirm(address)
      })

      await walletStore.onConnect()
    },

    async connectLedgerCosmos(
      injectiveAddress: string,
      derivationPath?: string
    ) {
      const walletStore = useSharedWalletStore()
      const walletStrategy = await getWalletStrategy()

      await walletStore.connectWallet(Wallet.LedgerCosmos)
      walletStrategy.setMetadata({ derivationPath })

      const ethereumAddress = getEthereumAddress(injectiveAddress)
      const session = await walletStrategy.getSessionOrConfirm()

      walletStore.$patch({
        session,
        injectiveAddress,
        address: ethereumAddress,
        addresses: [ethereumAddress],
        addressConfirmation:
          await walletStrategy.getSessionOrConfirm(injectiveAddress),
        hwAddressInfo: {
          address: ethereumAddress,
          derivationPath: derivationPath || '',
          baseDerivationPath: ''
        }
      })

      await walletStore.onConnect()
    },

    async connectCosmosStation() {
      const walletStore = useSharedWalletStore()
      const walletStrategy = await getWalletStrategy()

      await walletStore.connectWallet(Wallet.Cosmostation)

      const injectiveAddresses = await getAddresses()
      const [injectiveAddress] = injectiveAddresses
      const session = await walletStrategy.getSessionOrConfirm()

      walletStore.$patch({
        session,
        injectiveAddress,
        addresses: injectiveAddresses,
        address: getEthereumAddress(injectiveAddress || ''),
        addressConfirmation:
          await walletStrategy.getSessionOrConfirm(injectiveAddress)
      })

      await walletStore.onConnect()
    }
  }
})
