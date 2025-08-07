import { Wallet } from '@injectivelabs/wallet-base'
import {
  PrivateKey,
  getEthereumAddress,
  getInjectiveAddress
} from '@injectivelabs/sdk-ts'
import {
  getAddresses,
  walletStrategy,
  confirmCosmosWalletAddress
} from '../../WalletService'

export const connectEvmWallet = async (wallet: Wallet) => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(wallet)

  const addresses = await getAddresses()
  const [address] = addresses
  const session = await walletStrategy.getSessionOrConfirm(address)

  walletStore.$patch({
    address,
    session,
    addresses,
    injectiveAddress: getInjectiveAddress(address),
    addressConfirmation: await walletStrategy.getSessionOrConfirm(address)
  })

  await walletStore.onConnect()
}

export const connectCosmosWallet = async (wallet: Wallet) => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(wallet)

  const injectiveAddresses = await getAddresses()
  const [injectiveAddress] = injectiveAddresses
  const session = await walletStrategy.getSessionOrConfirm()

  await confirmCosmosWalletAddress(wallet, injectiveAddress)

  console.log({
    session,
    injectiveAddress,
    addresses: injectiveAddresses,
    address: getEthereumAddress(injectiveAddress),
    addressConfirmation:
      await walletStrategy.getSessionOrConfirm(injectiveAddress)
  })

  walletStore.$patch({
    session,
    injectiveAddress,
    addresses: injectiveAddresses,
    address: getEthereumAddress(injectiveAddress),
    addressConfirmation:
      await walletStrategy.getSessionOrConfirm(injectiveAddress)
  })

  await walletStore.onConnect()
}

export const connectLedger = async ({
  wallet,
  address
}: {
  wallet: Wallet
  address: string
}) => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(wallet)

  const ethereumAddress = getEthereumAddress(address)
  const session = await walletStrategy.getSessionOrConfirm(ethereumAddress)

  walletStore.$patch({
    session,
    address: ethereumAddress,
    injectiveAddress: address,
    addresses: [ethereumAddress],
    addressConfirmation:
      await walletStrategy.getSessionOrConfirm(ethereumAddress)
  })

  await walletStore.onConnect()
}

export const connectTrezor = async ({
  wallet,
  address
}: {
  wallet: Wallet
  address: string
}) => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(wallet)

  const ethereumAddress = getEthereumAddress(address)
  const session = await walletStrategy.getSessionOrConfirm(ethereumAddress)

  walletStore.$patch({
    session,
    address: ethereumAddress,
    injectiveAddress: address,
    addresses: [ethereumAddress],
    addressConfirmation:
      await walletStrategy.getSessionOrConfirm(ethereumAddress)
  })

  await walletStore.onConnect()
}

export const connectPrivateKey = async (privateKeyHash: string) => {
  const walletStore = useSharedWalletStore()

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
}

export const connectAddress = async (injectiveAddress: string) => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.Metamask)

  const addresses = [getEthereumAddress(injectiveAddress)]
  const [address] = addresses
  const session = await walletStrategy.getSessionOrConfirm(address)

  walletStore.$patch({
    address,
    session,
    addresses,
    isDev: true,
    injectiveAddress,
    addressConfirmation: await walletStrategy.getSessionOrConfirm(address)
  })

  await walletStore.onConnect()
}

export const connectLedgerCosmos = async (injectiveAddress: string) => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.LedgerCosmos)

  const ethereumAddress = getEthereumAddress(injectiveAddress)
  const session = await walletStrategy.getSessionOrConfirm()

  walletStore.$patch({
    session,
    injectiveAddress,
    address: ethereumAddress,
    addresses: [ethereumAddress],
    addressConfirmation:
      await walletStrategy.getSessionOrConfirm(injectiveAddress)
  })

  await walletStore.onConnect()
}

export const connectCosmosStation = async () => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.Cosmostation)

  const injectiveAddresses = await getAddresses()
  const [injectiveAddress] = injectiveAddresses
  const session = await walletStrategy.getSessionOrConfirm()

  walletStore.$patch({
    session,
    injectiveAddress,
    addresses: injectiveAddresses,
    address: getEthereumAddress(injectiveAddress),
    addressConfirmation:
      await walletStrategy.getSessionOrConfirm(injectiveAddress)
  })

  await walletStore.onConnect()
}
