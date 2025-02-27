import { EthereumChainId, type AccountAddress } from '@injectivelabs/ts-types'
import {
  ErrorType,
  GeneralException,
  UnspecifiedErrorCode,
  BitGetException
} from '@injectivelabs/exceptions'
import { UtilsWallets } from '@injectivelabs/wallet-ts/exports'
import { ETHEREUM_CHAIN_ID } from './../utils/constant'
import { walletStrategy } from './wallet-strategy'

export const isBitGetInstalled = async (): Promise<boolean> => {
  const provider = await UtilsWallets.getBitGetProvider()

  return !!provider
}

export const validateBitGet = async (
  address: AccountAddress,
  chainId: EthereumChainId = ETHEREUM_CHAIN_ID
) => {
  const addresses = await walletStrategy.enableAndGetAddresses()
  const bitGetIsLocked = addresses.length === 0

  if (bitGetIsLocked) {
    throw new BitGetException(
      new Error('Your BitGet is currently locked. Please unlock your BitGet.'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const [bitGetActiveAddress] = addresses
  const bitGetActiveAddressDoesntMatchTheActiveAddress =
    address && bitGetActiveAddress.toLowerCase() !== address.toLowerCase()

  if (bitGetActiveAddressDoesntMatchTheActiveAddress) {
    throw new BitGetException(
      new Error(`You are connected to the wrong address. Please reconnect!`),
      {
        contextModule: 'BitGet',
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const bitGetChainId = parseInt(await walletStrategy.getEthereumChainId(), 16)
  const bitGetChainIdDoesntMatchTheActiveChainId = chainId !== bitGetChainId

  if (bitGetChainIdDoesntMatchTheActiveChainId) {
    return await UtilsWallets.updateBitGetNetwork(chainId)
  }

  const bitGetProvider = await UtilsWallets.getBitGetProvider()

  if (!bitGetProvider) {
    throw new GeneralException(
      new Error('You are connected to the wrong wallet. Please use BitGet.'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }
}
