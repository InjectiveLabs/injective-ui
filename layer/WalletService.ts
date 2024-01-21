import { MsgBroadcaster, Web3Broadcaster } from '@injectivelabs/wallet-ts'
import { walletStrategy } from './wallet/wallet-strategy'
import {
  NETWORK,
  ENDPOINTS,
  ETHEREUM_CHAIN_ID,
  FEE_PAYER_PUB_KEY
} from './utils/constant'

// Transaction broadcaster
export const msgBroadcaster = new MsgBroadcaster({
  walletStrategy,
  network: NETWORK,
  endpoints: ENDPOINTS,
  feePayerPubKey: FEE_PAYER_PUB_KEY,
  simulateTx: true
})

export const web3Broadcaster = new Web3Broadcaster({
  walletStrategy,
  network: NETWORK,
  ethereumChainId: ETHEREUM_CHAIN_ID
})
