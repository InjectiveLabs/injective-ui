import { EthereumChainId } from '@injectivelabs/ts-types'
import { WalletStrategy, Wallet } from '@injectivelabs/wallet-ts'
import {
  CHAIN_ID,
  IS_TESTNET,
  ALCHEMY_KEY,
  ETHEREUM_CHAIN_ID,
  ALCHEMY_KOVAN_KEY,
  ALCHEMY_GOERLI_KEY
} from './../utils/constant'

export const getRpcUrlsForChainIds = (): Record<EthereumChainId, string> => {
  return {
    [EthereumChainId.Ganache]: 'http://localhost:8545',
    [EthereumChainId.HardHat]: 'http://localhost:8545',
    [EthereumChainId.Goerli]: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_GOERLI_KEY}`,
    [EthereumChainId.Kovan]: `https://eth-kovan.alchemyapi.io/v2/${ALCHEMY_KOVAN_KEY}`,
    [EthereumChainId.Mainnet]: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
    [EthereumChainId.Injective]: '',
    [EthereumChainId.Rinkeby]: '',
    [EthereumChainId.Ropsten]: ''
  }
}

export const alchemyRpcEndpoint = IS_TESTNET
  ? `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_GOERLI_KEY}`
  : `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`

const rpcUrls = getRpcUrlsForChainIds()

export const walletStrategy = new WalletStrategy({
  chainId: CHAIN_ID,
  ethereumOptions: {
    ethereumChainId: ETHEREUM_CHAIN_ID,
    rpcUrl: rpcUrls[ETHEREUM_CHAIN_ID]
  },
  disabledWallets: [Wallet.Trezor, Wallet.WalletConnect, Wallet.Torus]
})
