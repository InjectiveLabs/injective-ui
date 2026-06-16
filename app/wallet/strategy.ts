import { MsgBroadcasterWithPk } from '@injectivelabs/sdk-ts/core/tx'
import { alchemyRpcEndpoint, getRpcUrlsForChainIds } from './utils/alchemy'
import { WalletConnectStrategyEventType } from '@injectivelabs/wallet-base/light'
import {
  NETWORK,
  CHAIN_ID,
  ENDPOINTS,
  IS_MAINNET,
  TURNKEY_ORGID,
  MAGIC_APK_KEY,
  IS_TRUE_CURRENT,
  ETHEREUM_CHAIN_ID,
  FEE_PAYER_PUB_KEY,
  TURNKEY_GOOGLE_CLIENT_ID,
  WALLET_CONNECT_PROJECT_ID
} from '../utils/constant'
import type { WalletStrategy } from '@injectivelabs/wallet-strategy'
import type { MsgBroadcasterOptions } from '@injectivelabs/wallet-core'
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
let msgBroadcasterWithPkInstance: null | MsgBroadcasterWithPk = null

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
                apiServerEndpoint: IS_TRUE_CURRENT
                  ? IS_MAINNET
                    ? 'https://api.ui.tc.xyz/api/v1'
                    : 'https://api.ui.staging.tc.xyz/api/v1'
                  : IS_MAINNET
                    ? 'https://api.ui.injective.network/api/v1'
                    : 'https://api.ui.staging.injective.network/api/v1',
                expirationSeconds: '86400'
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
      import('@injectivelabs/wallet-base/light')
    ]).then(([{ WalletStrategy }, { Wallet }]) => {
      return new WalletStrategy({
        chainId: CHAIN_ID,
        wallet: Wallet.PrivateKeyCosmos,
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

export const getAutoSignMsgBroadcaster = (
  options?: Partial<MsgBroadcasterOptions>
): Promise<MsgBroadcaster> => {
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
        walletStrategy,
        ...options
      })
    })
  }

  return autoSignMsgBroadcasterPromise
}

export const getMsgBroadcasterWithPk = (
  privateKey: string,
  options?: Partial<MsgBroadcasterOptions>
): MsgBroadcasterWithPk => {
  if (!msgBroadcasterWithPkInstance) {
    msgBroadcasterWithPkInstance = new MsgBroadcasterWithPk({
      privateKey,
      network: NETWORK,
      endpoints: ENDPOINTS,
      ...options
    })
  }

  return msgBroadcasterWithPkInstance
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
