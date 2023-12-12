import {
  ErrorType,
  UnspecifiedErrorCode,
  ChainCosmosErrorCode,
  CosmosWalletException
} from '@injectivelabs/exceptions'
import { CosmosChainId } from '@injectivelabs/ts-types'
import { CosmosWalletStrategy, Wallet } from '@injectivelabs/wallet-ts'
import { CHAIN_ID } from './../utils/constant'

export const validateCosmosWallet = async ({
  wallet,
  address
}: {
  wallet: Wallet
  address: string
}) => {
  const chainId = CHAIN_ID as unknown as CosmosChainId

  const cosmosWalletStrategy = new CosmosWalletStrategy({
    wallet,
    chainId
  })

  const accounts = await cosmosWalletStrategy.getAddresses()

  if (accounts.length === 0) {
    throw new CosmosWalletException(
      new Error('Your Keplr wallet is not installed or its not unlocked'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletNotInstalledError
      }
    )
  }

  const [account] = accounts
  const activeAddressDoesntMatchTheActiveAddress =
    address && account.toLowerCase() !== address.toLowerCase()

  if (activeAddressDoesntMatchTheActiveAddress) {
    throw new CosmosWalletException(
      new Error(
        `You are connected to the wrong address. Your connected address is ${address}`
      ),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }
}
