import { WalletStrategy, Wallet } from '@injectivelabs/wallet-ts'
import {
  CHAIN_ID,
  APP_NAME,
  ENDPOINTS,
  IS_MAINNET,
  ALCHEMY_KEY,
  APP_BASE_URL,
  MAGIC_APK_KEY,
  ETHEREUM_CHAIN_ID,
  ALCHEMY_SEPOLIA_KEY,
  WALLET_CONNECT_PROJECT_ID
} from './../utils/constant'
import { alchemyRpcEndpoint } from './alchemy'

export const walletStrategy = new WalletStrategy({
  chainId: CHAIN_ID,
  ethereumOptions: {
    ethereumChainId: ETHEREUM_CHAIN_ID,
    rpcUrl: alchemyRpcEndpoint
  },
  options: {
    metadata: {
      magic: {
        apiKey: MAGIC_APK_KEY as string,
        rpcEndpoint: ENDPOINTS.rpc as string
      },
      name: APP_NAME,
      url: APP_BASE_URL,
      projectId: WALLET_CONNECT_PROJECT_ID,
      description: ''
    }
  }
})

export const autoSignWalletStrategy = new WalletStrategy({
  wallet: Wallet.PrivateKey,
  chainId: CHAIN_ID,
  ethereumOptions: {
    ethereumChainId: ETHEREUM_CHAIN_ID,
    rpcUrl: alchemyRpcEndpoint
  },
  options: {
    privateKey: ''
  }
})

export const alchemyKey = (
  IS_MAINNET ? ALCHEMY_KEY : ALCHEMY_SEPOLIA_KEY
) as string
