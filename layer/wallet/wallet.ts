import {
  ErrorType,
  WalletException,
  UnspecifiedErrorCode
} from '@injectivelabs/exceptions'
import { Wallet } from '@injectivelabs/wallet-ts'
import { walletStrategy } from './wallet-strategy'

export const connect = ({
  wallet
}: {
  wallet: Wallet
  // onAccountChangeCallback?: (account: string) => void,
}) => {
  walletStrategy.setWallet(wallet)
}

export const getAddresses = async (): Promise<string[]> => {
  const addresses = await walletStrategy.enableAndGetAddresses()

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

/** @deprecated - we should not use this anymore */
export const confirm = async (address: string) => {
  return await walletStrategy.confirm(address)
}
