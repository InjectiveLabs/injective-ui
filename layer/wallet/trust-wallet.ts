import { AccountAddress } from '@injectivelabs/ts-types'
import {
  ErrorType,
  UnspecifiedErrorCode,
  TrustWalletException
} from '@injectivelabs/exceptions'
import { UtilsWallets } from '@injectivelabs/wallet-ts/dist/esm/exports'
import { walletStrategy } from './wallet-strategy'
import { ETHEREUM_CHAIN_ID } from './../utils/constant'

export const isTrustWalletInstalled = async (): Promise<boolean> => {
  const provider = await UtilsWallets.getTrustWalletProvider()

  return !!provider
}

export const validateTrustWallet = async (address: AccountAddress) => {
  const addresses = await walletStrategy.enableAndGetAddresses()
  const trustWalletIsLocked = addresses.length === 0

  if (trustWalletIsLocked) {
    throw new TrustWalletException(
      new Error(
        'Your TrustWallet is currently locked. Please unlock your TrustWallet.'
      ),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const [trustWalletActiveAddress] = addresses
  const trustWalletActiveAddressDoesntMatchTheActiveAddress =
    address && trustWalletActiveAddress.toLowerCase() !== address.toLowerCase()

  if (trustWalletActiveAddressDoesntMatchTheActiveAddress) {
    throw new TrustWalletException(
      new Error(
        'You are connected to the wrong address. Please logout and connect to TrustWallet again'
      ),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  const trustWalletChainId = parseInt(
    await walletStrategy.getEthereumChainId(),
    16
  )
  const trustWalletChainIdDoesntMatchTheActiveChainId =
    ETHEREUM_CHAIN_ID !== trustWalletChainId

  if (trustWalletChainIdDoesntMatchTheActiveChainId) {
    return await UtilsWallets.updateTrustWalletNetwork(ETHEREUM_CHAIN_ID)
  }
}
