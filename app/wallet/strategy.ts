import { alchemyRpcEndpoint, getRpcUrlsForChainIds } from './utils/alchemy'
import { WalletConnectStrategyEventType } from '@injectivelabs/wallet-base'
import {
  NETWORK,
  CHAIN_ID,
  ENDPOINTS,
  TURNKEY_ORGID,
  MAGIC_APK_KEY,
  ETHEREUM_CHAIN_ID,
  FEE_PAYER_PUB_KEY,
  TURNKEY_GOOGLE_CLIENT_ID,
  WALLET_CONNECT_PROJECT_ID
} from '../utils/constant'
import type { WalletStrategy } from '@injectivelabs/wallet-strategy'
import type {
  MsgBroadcaster,
  Web3Broadcaster
} from '@injectivelabs/wallet-core'

const registerDefaultEventListeners = (walletStrategy: WalletStrategy) => {
  walletStrategy.on(
    WalletConnectStrategyEventType.WalletConnectSigningWithTxTimeout,
    (data) => {
      console.log('[WalletConnect] Signing with tx timeout:', data)
    }
  )
}

let walletStrategyPromise: null | Promise<WalletStrategy> = null
let autoSignWalletStrategyPromise: null | Promise<WalletStrategy> = null
let msgBroadcasterPromise: null | Promise<MsgBroadcaster> = null
let autoSignMsgBroadcasterPromise: null | Promise<MsgBroadcaster> = null
let web3BroadcasterPromise: null | Promise<Web3Broadcaster> = null

export const getWalletStrategy = (): Promise<WalletStrategy> => {
  if (!walletStrategyPromise) {
    walletStrategyPromise = import('@injectivelabs/wallet-strategy').then(
      ({ WalletStrategy }) => {
        const instance = new WalletStrategy({
          chainId: CHAIN_ID,
          evmOptions: {
            evmChainId: ETHEREUM_CHAIN_ID,
            rpcUrls: getRpcUrlsForChainIds()
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

        registerDefaultEventListeners(instance)

        return instance
      }
    )
  }

  return walletStrategyPromise
}

export const getAutoSignWalletStrategy = (): Promise<WalletStrategy> => {
  if (!autoSignWalletStrategyPromise) {
    autoSignWalletStrategyPromise = Promise.all([
      import('@injectivelabs/wallet-strategy'),
      import('@injectivelabs/wallet-base')
    ]).then(([{ WalletStrategy }, { Wallet }]) => {
      return new WalletStrategy({
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
    })
  }

  return autoSignWalletStrategyPromise
}

export const getMsgBroadcaster = (): Promise<MsgBroadcaster> => {
  if (!msgBroadcasterPromise) {
    msgBroadcasterPromise = Promise.all([
      import('@injectivelabs/wallet-core'),
      getWalletStrategy()
    ]).then(([{ MsgBroadcaster }, walletStrategy]) => {
      return new MsgBroadcaster({
        walletStrategy,
        simulateTx: true,
        network: NETWORK,
        endpoints: ENDPOINTS,
        gasBufferCoefficient: 1.2,
        feePayerPubKey: FEE_PAYER_PUB_KEY
      })
    })
  }

  return msgBroadcasterPromise
}

export const getAutoSignMsgBroadcaster = (): Promise<MsgBroadcaster> => {
  if (!autoSignMsgBroadcasterPromise) {
    autoSignMsgBroadcasterPromise = Promise.all([
      import('@injectivelabs/wallet-core'),
      getAutoSignWalletStrategy()
    ]).then(([{ MsgBroadcaster }, walletStrategy]) => {
      return new MsgBroadcaster({
        simulateTx: true,
        network: NETWORK,
        endpoints: ENDPOINTS,
        gasBufferCoefficient: 1.2,
        feePayerPubKey: FEE_PAYER_PUB_KEY,
        walletStrategy
      })
    })
  }

  return autoSignMsgBroadcasterPromise
}

export const getWeb3Broadcaster = (): Promise<Web3Broadcaster> => {
  if (!web3BroadcasterPromise) {
    web3BroadcasterPromise = Promise.all([
      import('@injectivelabs/wallet-core'),
      getWalletStrategy()
    ]).then(([{ Web3Broadcaster }, walletStrategy]) => {
      return new Web3Broadcaster({
        walletStrategy,
        network: NETWORK,
        evmChainId: ETHEREUM_CHAIN_ID
      })
    })
  }

  return web3BroadcasterPromise
}
