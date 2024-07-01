import {
  ErrorType,
  UnspecifiedErrorCode,
  CosmosWalletException
} from '@injectivelabs/exceptions'
import { PublicKey } from '@injectivelabs/sdk-ts'
import { CosmosWalletStrategy, Wallet } from '@injectivelabs/wallet-ts'
import { KeplrWallet } from '@injectivelabs/wallet-ts/dist/esm/utils/wallets/keplr'
import { CHAIN_ID } from './../utils/constant'
import { walletStrategy } from './wallet-strategy'

export const confirmCorrectKeplrAddress = async (injectiveAddress: string) => {
  // We only perform this check for Keplr addresses
  if (walletStrategy.getWallet() !== Wallet.Keplr) {
    return
  }

  const keplr = new KeplrWallet(CHAIN_ID)
  const key = await keplr.getKey()
  const publicKey = PublicKey.fromBase64(
    Buffer.from(key.pubKey).toString('base64')
  )

  const { address: derivedAddress } = publicKey.toAddress()

  if (derivedAddress !== injectiveAddress) {
    throw new CosmosWalletException(
      new Error(
        'Connected Keplr address is wrong. Please update Injective on Keplr.'
      )
    )
  }
}

export const validateCosmosWallet = async ({
  wallet,
  address
}: {
  wallet: Wallet
  address: string
}) => {
  const chainId = CHAIN_ID as unknown as any

  const cosmosWalletStrategy = new CosmosWalletStrategy({
    wallet,
    chainId
  })

  const accounts = await cosmosWalletStrategy.enableAndGetAddresses()

  if (accounts.length === 0) {
    throw new CosmosWalletException(
      new Error('Your wallet is not installed or its not unlocked'),
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
