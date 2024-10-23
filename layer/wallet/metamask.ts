import {
  ErrorType,
  GeneralException,
  MetamaskException,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'
import { walletStrategy } from './wallet-strategy'
import { ETHEREUM_CHAIN_ID } from './../utils/constant'
import { UtilsWallets } from '@injectivelabs/wallet-ts/dist/esm/exports'
export const isMetamaskInstalled = async (): Promise<boolean> => {
  const provider = await UtilsWallets.getMetamaskProvider()

  return !!provider
}

export const validateMetamask = async (address: string) => {
  const chainId = ETHEREUM_CHAIN_ID
  const addresses = await walletStrategy.enableAndGetAddresses()
  const metamaskIsLocked = addresses.length === 0

  if (metamaskIsLocked) {
    throw new MetamaskException(
      new Error(
        'Your Metamask is currently locked. Please unlock your Metamask.'
      ),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const [metamaskActiveAddress] = addresses
  const metamaskActiveAddressDoesntMatchTheActiveAddress =
    address && metamaskActiveAddress.toLowerCase() !== address.toLowerCase()

  if (metamaskActiveAddressDoesntMatchTheActiveAddress) {
    throw new MetamaskException(
      new Error(
        'You are connected to the wrong address. Please logout and connect to Metamask again'
      ),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const metamaskChainId = parseInt(
    await walletStrategy.getEthereumChainId(),
    16
  )
  const metamaskChainIdDoesntMatchTheActiveChainId = chainId !== metamaskChainId

  if (metamaskChainIdDoesntMatchTheActiveChainId) {
    return await UtilsWallets.updateMetamaskNetwork(chainId)
  }

  const metamaskProvider = await UtilsWallets.getMetamaskProvider()

  if (!metamaskProvider) {
    throw new GeneralException(
      new Error('You are connected to the wrong wallet. Please use Metamask.'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  if (
    metamaskProvider.isPhantom ||
    metamaskProvider.isOkxWallet ||
    metamaskProvider.isTrustWallet
  ) {
    throw new GeneralException(
      new Error('You are connected to the wrong wallet. Please use Metamask.'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }
}

export const switchToActiveMetamaskNetwork = async () => {
  await UtilsWallets.updateMetamaskNetwork(ETHEREUM_CHAIN_ID)
}
