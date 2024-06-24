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
import { Wallet } from '@injectivelabs/wallet-ts'
import { GrantDirection, AutoSign, EventBus } from '../../types'
import { useSharedWalletStore } from '.'

export const connectAuthZ = (
  injectiveAddress: string,
  direction: GrantDirection = GrantDirection.Granter
) => {
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
}

export const connectAutoSign = async (msgsType: string[]) => {
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

  console.log('here')

  await walletStore.broadcastWithFeeDelegation(authZMsgs)

  const autoSign = {
    injectiveAddress,
    privateKey: privateKey.toPrivateKeyHex(),
    expiration: nowInSeconds + expirationInSeconds,
    duration: expirationInSeconds
  }

  console.log('autosign')

  walletStore.$patch({
    autoSign
  })

  await walletStore.connectWallet(Wallet.PrivateKey, {
    privateKey: autoSign.privateKey,
    isAutoSign: true
  })
}

export const validateAutoSign = async (msgsType: string[]) => {
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

  await walletStore.connectWallet(walletStore.wallet)

  await walletStore.broadcastWithFeeDelegation({
    msgs: authZMsgs,
    injectiveAddress: walletStore.injectiveAddress
  })

  walletStore.$patch((state) => {
    state.autoSign = {
      ...autoSign,
      expiration: expirationInSeconds
    }
  })

  await walletStore.connectWallet(Wallet.PrivateKey, {
    privateKey: autoSign.privateKey,
    isAutoSign: true
  })
}

export const resetAuthZ = () => {
  const walletStore = useSharedWalletStore()

  walletStore.$patch({
    authZ: {
      address: '',
      defaultSubaccountId: '',
      direction: GrantDirection.Granter,
      injectiveAddress: ''
    }
  })

  walletStore.onConnect()
}

export const disconnectAutoSign = async () => {
  const walletStore = useSharedWalletStore()

  walletStore.$patch({
    autoSign: undefined
  })

  await walletStore.connectWallet(walletStore.wallet)
  await walletStore.onConnect()
}
