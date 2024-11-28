import { WalletStrategy } from '@injectivelabs/wallet-strategy'
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
  },
  strategies: {}
})

export const alchemyKey = (
  IS_MAINNET ? ALCHEMY_KEY : ALCHEMY_SEPOLIA_KEY
) as string
