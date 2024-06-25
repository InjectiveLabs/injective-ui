import {
  MsgGrant,
  PrivateKey,
  getEthereumAddress,
  getDefaultSubaccountId,
  getGenericAuthorizationFromMessageType
} from '@injectivelabs/sdk-ts'
import { Wallet } from '@injectivelabs/wallet-ts'
import { msgBroadcaster } from './../../WalletService'
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

  await walletStore.broadcastWithFeeDelegation({ messages: authZMsgs })

  const autoSign = {
    injectiveAddress,
    privateKey: privateKey.toPrivateKeyHex(),
    expiration: nowInSeconds + expirationInSeconds,
    duration: expirationInSeconds
  }

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
    messages: authZMsgs,
    memo: walletStore.injectiveAddress
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
