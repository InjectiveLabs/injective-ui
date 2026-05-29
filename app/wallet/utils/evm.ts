import { INJECTIVE_EVM_CHAIN_ID } from '../../utils/constant'
import { Wallet, isEvmBrowserWallet } from '@injectivelabs/wallet-base'
import {
  ErrorType,
  WalletException,
  BitGetException,
  MetamaskException,
  OkxWalletException,
  UnspecifiedErrorCode,
  TrustWalletException
} from '@injectivelabs/exceptions'
import {
  getRabbyProvider,
  getBitGetProvider,
  getRainbowProvider,
  getPhantomProvider,
  getKeplrEvmProvider,
  getMetamaskProvider,
  getOkxWalletProvider,
  getTrustWalletProvider
} from '@injectivelabs/wallet-evm'
import { getWalletStrategy } from '../strategy'
import type { AccountAddress } from '@injectivelabs/ts-types'
import type { EvmWalletStrategy } from '@injectivelabs/wallet-evm'
import type { BrowserEip1993Provider } from '@injectivelabs/wallet-base'
import type { ErrorContext, ThrownException } from '@injectivelabs/exceptions'

export const getEvmProvidersFromWalletStrategy = async (): Promise<
  Partial<Record<Wallet, BrowserEip1993Provider>>
> => {
  const walletStrategy = await getWalletStrategy()
  const strategies = walletStrategy.strategies

  const evmStrategy =
    strategies[Wallet.Metamask] ||
    strategies[Wallet.Rabby] ||
    strategies[Wallet.Rainbow] ||
    strategies[Wallet.KeplrEvm] ||
    strategies[Wallet.OkxWallet]

  return (evmStrategy as EvmWalletStrategy)?.evmProviders || {}
}

export const getEvmWalletProvider = async (wallet: Wallet) => {
  const evmProviders = await getEvmProvidersFromWalletStrategy()

  if (evmProviders[wallet]) {
    return evmProviders[wallet]
  }

  if (wallet === Wallet.Metamask) {
    return await getMetamaskProvider()
  }

  if (wallet === Wallet.BitGet) {
    return await getBitGetProvider()
  }

  if (wallet === Wallet.OkxWallet) {
    return await getOkxWalletProvider()
  }

  if (wallet === Wallet.Phantom) {
    return await getPhantomProvider()
  }

  if (wallet === Wallet.TrustWallet) {
    return await getTrustWalletProvider()
  }

  if (wallet === Wallet.Rainbow) {
    return await getRainbowProvider()
  }

  if (wallet === Wallet.Rabby) {
    return await getRabbyProvider()
  }

  if (wallet === Wallet.KeplrEvm) {
    return await getKeplrEvmProvider()
  }
}

export const isBitGetInstalled = async (): Promise<boolean> => {
  const provider = await getBitGetProvider()

  return !!provider
}

export const getEvmWalletException = (
  wallet: Wallet,
  error: Error,
  context?: ErrorContext
): ThrownException => {
  if (wallet === Wallet.Metamask) {
    return new MetamaskException(error, context)
  }

  if (wallet === Wallet.BitGet) {
    return new BitGetException(error, context)
  }

  if (wallet === Wallet.OkxWallet) {
    return new OkxWalletException(error, context)
  }

  if (wallet === Wallet.Phantom) {
    return new MetamaskException(error, context)
  }

  if (wallet === Wallet.TrustWallet) {
    return new TrustWalletException(error, context)
  }

  return new WalletException(error, context)
}

export const validateEvmWallet = async ({
  wallet,
  address
}: {
  wallet: Wallet
  address: AccountAddress
}) => {
  const walletStrategy = await getWalletStrategy()
  const accounts = await walletStrategy.enableAndGetAddresses()
  const isAccountLocked = accounts.length === 0

  if (isAccountLocked) {
    throw getEvmWalletException(
      wallet,
      new Error('Your wallet is currently locked. Please unlock your BitGet.'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const [account] = accounts
  const walletActiveAddressDoesntMatchTheActiveAddress =
    account && account.toLowerCase() !== address.toLowerCase()

  if (walletActiveAddressDoesntMatchTheActiveAddress) {
    throw getEvmWalletException(
      wallet,
      new Error(`You are connected to the wrong address. Please reconnect!`),
      {
        contextModule: 'BitGet',
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const provider = await getEvmWalletProvider(wallet)

  if (!provider) {
    throw getEvmWalletException(
      wallet,
      new Error('You are connected to the wrong wallet.'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }
}

export const switchToInjectiveEvmNetwork = async (
  wallet: Wallet
): Promise<boolean> => {
  if (!isEvmBrowserWallet(wallet)) {
    return true
  }

  const walletStrategy = await getWalletStrategy()
  const strategy = walletStrategy.strategies[wallet]
  const provider = await getEvmWalletProvider(wallet)

  if (!strategy || !provider) {
    return true
  }

  await (strategy as EvmWalletStrategy).addEvmNetwork(INJECTIVE_EVM_CHAIN_ID)

  return true
}
