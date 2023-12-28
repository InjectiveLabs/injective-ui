import {
  ErrorType,
  GeneralException,
  MetamaskException,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'
import { EthereumChainId } from '@injectivelabs/ts-types'
import { walletStrategy } from './wallet-strategy'
import { ETHEREUM_CHAIN_ID, IS_MAINNET } from './../utils/constant'
import { UtilsWallets, Wallet } from '@injectivelabs/wallet-ts'

export const isMetamaskInstalled = async (): Promise<boolean> => {
  const provider = await UtilsWallets.getMetamaskProvider()

  return !!provider
}

export const validateMetamask = async (address: string) => {
  const chainId = ETHEREUM_CHAIN_ID
  const addresses = await walletStrategy.getAddresses()
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
    if (chainId === EthereumChainId.Kovan) {
      throw new MetamaskException(
        new Error('Please change your Metamask network to Kovan Test Network'),
        {
          code: UnspecifiedErrorCode,
          type: ErrorType.WalletError
        }
      )
    }
    if (chainId === EthereumChainId.Goerli) {
      throw new MetamaskException(
        new Error('Please change your Metamask network to Goerli Test Network'),
        {
          code: UnspecifiedErrorCode,
          type: ErrorType.WalletError
        }
      )
    }

    throw new MetamaskException(
      new Error('Please change your Metamask network to Ethereum Mainnet'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
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

  if (!metamaskProvider.isMetaMask || metamaskProvider.isPhantom) {
    throw new GeneralException(
      new Error('You are connected to the wrong wallet. Please use Metamask.'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }
}

export const switchToActiveMetamaskNetwork = async (
  wallet: Wallet,
  ethereumChainId: EthereumChainId
) => {
  if (wallet !== Wallet.Metamask) {
    return
  }

  const chainId = IS_MAINNET ? EthereumChainId.Mainnet : EthereumChainId.Goerli

  try {
    await UtilsWallets.updateMetamaskNetwork(chainId)
  } catch (e) {
    throw e
  }
}
