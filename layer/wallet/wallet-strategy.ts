import { Wallet } from '@injectivelabs/wallet-base'
import { WalletStrategy } from '@injectivelabs/wallet-strategy'
import {
  CHAIN_ID,
  APP_NAME,
  ENDPOINTS,
  APP_BASE_URL,
  MAGIC_APK_KEY,
  ETHEREUM_CHAIN_ID,
  WALLET_CONNECT_PROJECT_ID
} from './../utils/constant'
import { alchemyRpcEndpoint } from './alchemy'

let walletStrategy: WalletStrategy
let autoSignWalletStrategy: WalletStrategy

export const getWalletStrategy = () => {
  if (!walletStrategy) {
    walletStrategy = new WalletStrategy({
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
  }

  return walletStrategy
}

export const getAutoSignWalletStrategy = () => {
  if (!autoSignWalletStrategy) {
    autoSignWalletStrategy = new WalletStrategy({
      chainId: CHAIN_ID,
      wallet: Wallet.PrivateKey,
      ethereumOptions: {
        ethereumChainId: ETHEREUM_CHAIN_ID,
        rpcUrl: alchemyRpcEndpoint
      },
      options: {
        privateKey: ''
      },
      strategies: {}
    })
  }

  return autoSignWalletStrategy
}
