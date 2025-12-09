import { alchemyRpcEndpoint } from './utils/alchemy'
import {
  NETWORK,
  CHAIN_ID,
  ENDPOINTS,
  ALCHEMY_KEY,
  TURNKEY_ORGID,
  MAGIC_APK_KEY,
  ETHEREUM_CHAIN_ID,
  FEE_PAYER_PUB_KEY,
  ALCHEMY_SEPOLIA_KEY,
  TURNKEY_GOOGLE_CLIENT_ID,
  WALLET_CONNECT_PROJECT_ID
} from '../utils/constant'
import type { WalletStrategy } from '@injectivelabs/wallet-strategy'
import type {
  MsgBroadcaster,
  Web3Broadcaster
} from '@injectivelabs/wallet-core'

let walletStrategyInstance: null | WalletStrategy = null
let autoSignWalletStrategyInstance: null | WalletStrategy = null
let msgBroadcasterInstance: null | MsgBroadcaster = null
let autoSignMsgBroadcasterInstance: null | MsgBroadcaster = null
let web3BroadcasterInstance: null | Web3Broadcaster = null

export const getWalletStrategy = async (): Promise<WalletStrategy> => {
  if (walletStrategyInstance) {
    return walletStrategyInstance
  }

  const [{ WalletStrategy }, { EvmChainId }] = await Promise.all([
    import('@injectivelabs/wallet-strategy'),
    import('@injectivelabs/ts-types')
  ])

  walletStrategyInstance = new WalletStrategy({
    chainId: CHAIN_ID,
    evmOptions: {
      evmChainId: ETHEREUM_CHAIN_ID,
      rpcUrls: {
        [EvmChainId.Mainnet]: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
        [EvmChainId.Sepolia]: `https://eth-sepolia.alchemyapi.io/v2/${ALCHEMY_SEPOLIA_KEY}`,
        [EvmChainId.MainnetEvm]: 'https://sentry.evm-rpc.injective.network/',
        [EvmChainId.TestnetEvm]:
          'https://k8s.testnet.json-rpc.injective.network/',
        [EvmChainId.DevnetEvm]: 'https://devnet.json-rpc.injective.dev/'
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
          googleClientId: TURNKEY_GOOGLE_CLIENT_ID,
          googleRedirectUri: window.location.origin,
          apiServerEndpoint: 'https://api.ui.injective.network/api/v1'
        }
      })
    },
    strategies: {}
  })

  return walletStrategyInstance
}

export const getAutoSignWalletStrategy = async (): Promise<WalletStrategy> => {
  if (autoSignWalletStrategyInstance) {
    return autoSignWalletStrategyInstance
  }

  const [{ WalletStrategy }, { Wallet }] = await Promise.all([
    import('@injectivelabs/wallet-strategy'),
    import('@injectivelabs/wallet-base')
  ])

  autoSignWalletStrategyInstance = new WalletStrategy({
    chainId: CHAIN_ID,
    wallet: Wallet.PrivateKey,
    evmOptions: {
      evmChainId: ETHEREUM_CHAIN_ID,
      rpcUrl: alchemyRpcEndpoint
    },
    metadata: {
      privateKey: {
        privateKey: ''
      }
    },
    strategies: {}
  })

  return autoSignWalletStrategyInstance
}

export const getMsgBroadcaster = async (): Promise<MsgBroadcaster> => {
  if (msgBroadcasterInstance) {
    return msgBroadcasterInstance
  }

  const [{ MsgBroadcaster }, walletStrategy] = await Promise.all([
    import('@injectivelabs/wallet-core'),
    getWalletStrategy()
  ])

  msgBroadcasterInstance = new MsgBroadcaster({
    walletStrategy,
    simulateTx: true,
    network: NETWORK,
    endpoints: ENDPOINTS,
    gasBufferCoefficient: 1.2,
    feePayerPubKey: FEE_PAYER_PUB_KEY
  })

  return msgBroadcasterInstance
}

export const getAutoSignMsgBroadcaster = async (): Promise<MsgBroadcaster> => {
  if (autoSignMsgBroadcasterInstance) {
    return autoSignMsgBroadcasterInstance
  }

  const [{ MsgBroadcaster }, walletStrategy] = await Promise.all([
    import('@injectivelabs/wallet-core'),
    getAutoSignWalletStrategy()
  ])

  autoSignMsgBroadcasterInstance = new MsgBroadcaster({
    simulateTx: true,
    network: NETWORK,
    endpoints: ENDPOINTS,
    gasBufferCoefficient: 1.2,
    feePayerPubKey: FEE_PAYER_PUB_KEY,
    walletStrategy
  })

  return autoSignMsgBroadcasterInstance
}

export const getWeb3Broadcaster = async (): Promise<Web3Broadcaster> => {
  if (web3BroadcasterInstance) {
    return web3BroadcasterInstance
  }

  const [{ Web3Broadcaster }, walletStrategy] = await Promise.all([
    import('@injectivelabs/wallet-core'),
    getWalletStrategy()
  ])

  web3BroadcasterInstance = new Web3Broadcaster({
    walletStrategy,
    network: NETWORK,
    evmChainId: ETHEREUM_CHAIN_ID
  })

  return web3BroadcasterInstance
}
