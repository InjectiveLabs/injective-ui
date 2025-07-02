import { alchemyRpcEndpoint } from './alchemy'
import { Wallet } from '@injectivelabs/wallet-base'
import { EthereumChainId } from '@injectivelabs/ts-types'
import { WalletStrategy } from '@injectivelabs/wallet-strategy'
import {
  CHAIN_ID,
  ENDPOINTS,
  ALCHEMY_KEY,
  TURNKEY_ORGID,
  MAGIC_APK_KEY,
  ETHEREUM_CHAIN_ID,
  ALCHEMY_SEPOLIA_KEY,
  TURNKEY_CONTAINER_ID,
  TURNKEY_GOOGLE_CLIENT_ID,
  WALLET_CONNECT_PROJECT_ID
} from './../utils/constant'

export const walletStrategy = new WalletStrategy({
  chainId: CHAIN_ID,
  ethereumOptions: {
    ethereumChainId: ETHEREUM_CHAIN_ID,
    rpcUrls: {
      [EthereumChainId.Mainnet]: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
      [EthereumChainId.Sepolia]: `https://eth-sepolia.alchemyapi.io/v2/${ALCHEMY_SEPOLIA_KEY}`,
      [EthereumChainId.DevnetEvm]: 'https://devnet.json-rpc.injective.dev/',
      [EthereumChainId.TestnetEvm]:
        'https://testnet.sentry.chain.json-rpc.injective.network/'
    }
  },
  metadata: {
    magic: {
      apiKey: MAGIC_APK_KEY as string,
      rpcEndpoint: ENDPOINTS.rpc as string
    },
    walletConnect: {
      projectId: WALLET_CONNECT_PROJECT_ID
    },
    ...(TURNKEY_ORGID && {
      turnkey: {
        defaultOrganizationId: TURNKEY_ORGID,
        apiBaseUrl: 'https://api.turnkey.com',
        iframeContainerId: TURNKEY_CONTAINER_ID,
        googleClientId: TURNKEY_GOOGLE_CLIENT_ID,
        googleRedirectUri: window.location.origin,
        apiServerEndpoint: 'https://api.ui.injective.network/api/v1'
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
