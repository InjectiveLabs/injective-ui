import { alchemyRpcEndpoint } from './alchemy'
import { Wallet } from '@injectivelabs/wallet-base'
import { WalletStrategy } from '@injectivelabs/wallet-strategy'
import {
  CHAIN_ID,
  ENDPOINTS,
  TURNKEY_ORGID,
  MAGIC_APK_KEY,
  ETHEREUM_CHAIN_ID,
  TURNKEY_CONTAINER_ID,
  TURNKEY_GOOGLE_CLIENT_ID,
  WALLET_CONNECT_PROJECT_ID
} from './../utils/constant'

export const walletStrategy = new WalletStrategy({
  chainId: CHAIN_ID,
  ethereumOptions: {
    ethereumChainId: ETHEREUM_CHAIN_ID,
    rpcUrl: alchemyRpcEndpoint
  },
  metadata: {
    magic: {
      apiKey: MAGIC_APK_KEY as string,
      rpcEndpoint: ENDPOINTS.rpc as string
    },
    walletConnect: {
      projectId: WALLET_CONNECT_PROJECT_ID
    },
    ...(TURNKEY_ORGID &&{
      turnkey: {
        defaultOrganizationId: TURNKEY_ORGID,
        apiBaseUrl: "https://api.turnkey.com",
        iframeContainerId: TURNKEY_CONTAINER_ID,
        googleClientId: TURNKEY_GOOGLE_CLIENT_ID,
        googleRedirectUri: window.location.origin,
        apiServerEndpoint: "https://api.ui.injective.network/api/v1"
      }
    })
  },
  strategies: {}
})

export const autoSignWalletStrategy = new WalletStrategy({
  chainId: CHAIN_ID,
  wallet: Wallet.PrivateKey,
  ethereumOptions: {
    ethereumChainId: ETHEREUM_CHAIN_ID,
    rpcUrl: alchemyRpcEndpoint
  },
  metadata: {
    privateKey: {
      privateKey: ''
    }
  },
  strategies: {}
})
