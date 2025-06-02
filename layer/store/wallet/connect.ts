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

export const connectBitGet = async () => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.BitGet)

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

export const connectMetamask = async () => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.Metamask)

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

export const connectOkxWallet = async () => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.OkxWallet)

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

export const connectPhantomWallet = async () => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.Phantom)

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

export const connectTrustWallet = async () => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.TrustWallet)

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

export const connectWalletConnect = async () => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.WalletConnect)

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

export const connectLeap = async () => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.Leap)

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

export const connectNinji = async () => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.Ninji)

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

export const connectKeplr = async () => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.Keplr)

  const injectiveAddresses = await getAddresses()
  const [injectiveAddress] = injectiveAddresses
  const session = await walletStrategy.getSessionOrConfirm()

  await confirmCosmosWalletAddress(Wallet.Keplr, injectiveAddress)

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

export const connectRainbow = async () => {
  const walletStore = useSharedWalletStore()

  await walletStore.connectWallet(Wallet.Rainbow)

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
