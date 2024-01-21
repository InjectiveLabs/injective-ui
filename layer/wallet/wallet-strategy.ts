import { WalletStrategy } from '@injectivelabs/wallet-ts'
import { CHAIN_ID, ETHEREUM_CHAIN_ID } from './../utils/constant'
import { getRpcUrlsForChainIds } from './alchemy'

const rpcUrls = getRpcUrlsForChainIds()

export const walletStrategy = new WalletStrategy({
  chainId: CHAIN_ID,
  ethereumOptions: {
    ethereumChainId: ETHEREUM_CHAIN_ID,
    rpcUrl: rpcUrls[ETHEREUM_CHAIN_ID]
  }
})
