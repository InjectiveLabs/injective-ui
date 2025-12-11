import { EvmChainId } from '@injectivelabs/ts-types'
import {
  IS_DEVNET,
  IS_TESTNET,
  IS_MAINNET,
  ALCHEMY_KEY,
  ALCHEMY_SEPOLIA_KEY
} from '../../utils/constant'

export const getRpcUrlsForChainIds = (): Partial<
  Record<EvmChainId, string>
> => {
  return {
    [EvmChainId.Mainnet]: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    [EvmChainId.Sepolia]: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_KEY}`,
    [EvmChainId.MainnetEvm]: 'https://sentry.evm-rpc.injective.network/',
    [EvmChainId.TestnetEvm]: 'https://k8s.testnet.json-rpc.injective.network/',
    [EvmChainId.DevnetEvm]: 'https://devnet.json-rpc.injective.dev/'
  }
}

export const alchemyRpcEndpoint =
  IS_TESTNET || IS_DEVNET
    ? `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_KEY}`
    : `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`

export const alchemyKey = (
  IS_MAINNET ? ALCHEMY_KEY : ALCHEMY_SEPOLIA_KEY
) as string
