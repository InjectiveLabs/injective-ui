import { EvmChainId } from '@injectivelabs/ts-types'
import {
  IS_DEVNET,
  IS_TESTNET,
  IS_MAINNET,
  ALCHEMY_KEY,
  ALCHEMY_SEPOLIA_KEY
} from '../../utils/constant'
import {
  sei,
  ink,
  base,
  sonic,
  linea,
  mainnet,
  polygon,
  sepolia,
  arbitrum,
  optimism,
  avalanche,
  inkSepolia,
  baseSepolia,
  polygonAmoy,
  lineaSepolia,
  avalancheFuji,
  arbitrumSepolia,
  optimismSepolia
} from 'viem/chains'

export const getRpcUrlsForChainIds = (): Partial<
  Record<number, string>
> => {
  return {
    [sei.id]: `https://sei-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    [ink.id]: `https://ink-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    [base.id]: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    [sonic.id]: `https://sonic-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    [linea.id]: `https://linea-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    [mainnet.id]: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    [polygon.id]: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    [arbitrum.id]: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    [optimism.id]: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    [avalanche.id]: `https://avax-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    [sepolia.id]: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_KEY}`,
    [inkSepolia.id]: `https://ink-sepolia.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_KEY}`,
    [baseSepolia.id]: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_KEY}`,
    [polygonAmoy.id]: `https://polygon-amoy.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_KEY}`,
    [lineaSepolia.id]: `https://linea-sepolia.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_KEY}`,
    [avalancheFuji.id]: `https://avax-fuji.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_KEY}`,
    [arbitrumSepolia.id]: `https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_KEY}`,
    [optimismSepolia.id]: `https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_KEY}`,
    [EvmChainId.MainnetEvm]: `https://injective-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    [EvmChainId.TestnetEvm]: `https://injective-testnet.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_KEY}`,
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
