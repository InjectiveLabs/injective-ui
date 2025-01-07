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
  gasBufferCoefficient: 1.4,
  feePayerPubKey: FEE_PAYER_PUB_KEY
})

/**
 * MsgBroadcaster for auto-signing transactions.
 * This instance is configured with the wallet strategy, network settings,
 * endpoints, fee payer public key, and a gas buffer coefficient for
 * transaction simulation.
 */

export const autoSignMsgBroadcaster = new MsgBroadcaster({
  simulateTx: true,
  network: NETWORK,
  endpoints: ENDPOINTS,
  gasBufferCoefficient: 1.4,
  feePayerPubKey: FEE_PAYER_PUB_KEY,
  walletStrategy: autoSignWalletStrategy
})

export const web3Broadcaster = new Web3Broadcaster({
  walletStrategy,
  network: NETWORK,
  ethereumChainId: ETHEREUM_CHAIN_ID
})
