import { MsgBroadcaster, Web3Broadcaster } from '@injectivelabs/wallet-ts'
import {
  walletStrategy,
  autoSignWalletStrategy
} from './wallet/wallet-strategy'
import {
  NETWORK,
  ENDPOINTS,
  ETHEREUM_CHAIN_ID,
  FEE_PAYER_PUB_KEY
} from './utils/constant'

// Transaction broadcaster
export const msgBroadcaster = new MsgBroadcaster({
  walletStrategy,
  simulateTx: true,
  network: NETWORK,
  endpoints: ENDPOINTS,
  feePayerPubKey: FEE_PAYER_PUB_KEY,
  gasBufferCoefficient: 1.4
})

/**
 * MsgBroadcaster for auto-signing transactions.
 * This instance is configured with the wallet strategy, network settings,
 * endpoints, fee payer public key, and a gas buffer coefficient for
 * transaction simulation.
 */

export const autoSignMsgBroadcaster = new MsgBroadcaster({
  walletStrategy: autoSignWalletStrategy,
  network: NETWORK,
  endpoints: ENDPOINTS,
  feePayerPubKey: FEE_PAYER_PUB_KEY,
  gasBufferCoefficient: 1.4
})

export const web3Broadcaster = new Web3Broadcaster({
  walletStrategy,
  network: NETWORK,
  ethereumChainId: ETHEREUM_CHAIN_ID
})
