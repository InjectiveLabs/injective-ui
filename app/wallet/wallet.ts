import { walletStrategy } from './wallet-strategy'
import {
  ErrorType,
  WalletException,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'

export const getAddresses = async (args?: unknown): Promise<string[]> => {
  const addresses = await walletStrategy.enableAndGetAddresses(args)

  if (addresses.length === 0) {
    throw new WalletException(
      new Error('There are no addresses linked to this wallet.'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  if (!addresses.every((address) => !!address)) {
    throw new WalletException(
      new Error('There are no addresses linked to this wallet.'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  return addresses
}

export const getHwAddressesInfo = async () => {
  const addressInfo = await walletStrategy.getAddressesInfo()

  if (!addressInfo || addressInfo.length === 0) {
    throw new WalletException(
      new Error('There are no addresses linked to this hardware wallet.'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  return addressInfo
}
