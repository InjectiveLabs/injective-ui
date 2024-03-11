import { EthereumChainId } from '@injectivelabs/ts-types'
import {
  IS_DEVNET,
  IS_TESTNET,
  ALCHEMY_KEY,
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

export const alchemyRpcEndpoint =
  IS_TESTNET || IS_DEVNET
    ? `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_GOERLI_KEY}`
    : `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`
