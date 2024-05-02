import { WalletStrategy } from '@injectivelabs/wallet-ts'
import {
  CHAIN_ID,
  IS_MAINNET,
  ALCHEMY_KEY,
  ETHEREUM_CHAIN_ID,
  ALCHEMY_SEPOLIA_KEY
} from './../utils/constant'
import { alchemyRpcEndpoint } from './alchemy'

export const walletStrategy = new WalletStrategy({
  chainId: CHAIN_ID,
  ethereumOptions: {
    ethereumChainId: ETHEREUM_CHAIN_ID,
    rpcUrl: alchemyRpcEndpoint
  }
})

export const alchemyKey = (
  IS_MAINNET ? ALCHEMY_KEY : ALCHEMY_SEPOLIA_KEY
) as string
