import { WalletStrategy } from '@injectivelabs/wallet-ts'
import {
  CHAIN_ID,
  IS_MAINNET,
  ALCHEMY_KEY,
  ETHEREUM_CHAIN_ID,
  ALCHEMY_SEPOLIA_KEY
} from './../utils/constant'
import { alchemyRpcEndpoint } from './alchemy'
import {
  APP_NAME,
  ENDPOINTS,
  APP_BASE_URL,
  WALLET_CONNECT_PROJECT_ID
} from './../utils/constant'

export const walletStrategy = new WalletStrategy({
  chainId: CHAIN_ID,
  ethereumOptions: {
    ethereumChainId: ETHEREUM_CHAIN_ID,
    rpcUrl: alchemyRpcEndpoint
  },
  options: {
    metadata: {
      magicApiKey: 'pk_live_57BA82F0A1C914EA',
      rpcEndpoint: ENDPOINTS.rpc,
      name: APP_NAME,
      url: APP_BASE_URL,
      projectId: WALLET_CONNECT_PROJECT_ID,
      description: ''
    }
  }
})

export const alchemyKey = (
  IS_MAINNET ? ALCHEMY_KEY : ALCHEMY_SEPOLIA_KEY
) as string
