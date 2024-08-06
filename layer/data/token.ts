import {
  TokenType,
  TokenStatic,
  TokenVerification
} from '@injectivelabs/sdk-ts'
import { Network } from '@injectivelabs/networks'
import {
  INJ_DENOM,
  IS_TESTNET,
  INJ_LOGO_URL,
  USDT_LOGO_URL,
  UNKNOWN_LOGO_URL
} from './../utils/constant'

export const stableCoinSymbols = ['USDT', 'USDC', 'USDCet']

export const injectivePeggyAddress = {
  [Network.Mainnet]: '0xF955C57f9EA9Dc8781965FEaE0b6A2acE2BAD6f3',
  [Network.MainnetK8s]: '0xF955C57f9EA9Dc8781965FEaE0b6A2acE2BAD6f3',
  [Network.MainnetLB]: '0xF955C57f9EA9Dc8781965FEaE0b6A2acE2BAD6f3',
  [Network.MainnetSentry]: '0xF955C57f9EA9Dc8781965FEaE0b6A2acE2BAD6f3',
  [Network.MainnetOld]: '0xF955C57f9EA9Dc8781965FEaE0b6A2acE2BAD6f3',
  [Network.Staging]: '0xF955C57f9EA9Dc8781965FEaE0b6A2acE2BAD6f3',
  [Network.Internal]: '0xF955C57f9EA9Dc8781965FEaE0b6A2acE2BAD6f3',
  [Network.Testnet]: '0x12e1181a741b70BE6A9D81f85af3E92B6ba41897',
  [Network.TestnetK8s]: '0x12e1181a741b70BE6A9D81f85af3E92B6ba41897',
  [Network.TestnetSentry]: '0x12e1181a741b70BE6A9D81f85af3E92B6ba41897',
  [Network.TestnetOld]: '0x12e1181a741b70BE6A9D81f85af3E92B6ba41897',
  [Network.Devnet]: '0x430544ca09F7914077a0E8F405Da62292428F49D',
  [Network.Devnet1]: '0x0AAd19327a1b90DDE4e2D12FB99Ab8ee7E4E528D',
  [Network.Devnet2]: '0x0AAd19327a1b90DDE4e2D12FB99Ab8ee7E4E528D',
  [Network.Local]: '0x3c92F7779A7845d5eEf307aEF39066Ddba04A54b'
}

export const unknownToken: TokenStatic = {
  address: 'unknown',
  isNative: false,
  decimals: 18,
  symbol: 'Unknown',
  name: 'Unknown',
  logo: UNKNOWN_LOGO_URL,
  coinGeckoId: '',
  denom: 'unknown',
  externalLogo: 'unknown.png',
  tokenType: TokenType.Unknown,
  tokenVerification: TokenVerification.Unverified
}

export const injToken: TokenStatic = {
  address: INJ_DENOM,
  isNative: true,
  decimals: 18,
  symbol: 'INJ',
  name: 'Injective',
  logo: INJ_LOGO_URL,
  coinGeckoId: 'injective-protocol',
  denom: INJ_DENOM,
  externalLogo: 'injective-v3.png',
  tokenType: TokenType.Native,
  tokenVerification: TokenVerification.Verified
}

export const usdtToken: TokenStatic = {
  address: IS_TESTNET
    ? '0x87aB3B4C8661e07D6372361211B96ed4Dc36B1B5'
    : '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  isNative: false,
  decimals: 6,
  symbol: 'USDT',
  name: 'Tether',
  logo: USDT_LOGO_URL,
  coinGeckoId: 'tether',
  denom: IS_TESTNET
    ? 'peggy0x87aB3B4C8661e07D6372361211B96ed4Dc36B1B5'
    : 'peggy0xdAC17F958D2ee523a2206206994597C13D831ec7',
  tokenType: TokenType.Erc20,
  tokenVerification: TokenVerification.Verified
}

export const injErc20Token: TokenStatic = {
  address: IS_TESTNET
    ? '0x5512c04B6FF813f3571bDF64A1d74c98B5257332'
    : '0xe28b3b32b6c345a34ff64674606124dd5aceca30',
  isNative: false,
  tokenVerification: TokenVerification.Verified,
  decimals: 18,
  symbol: 'INJ',
  name: 'Injective',
  logo: 'https://imagedelivery.net/DYKOWp0iCc0sIkF-2e4dNw/c7b97294-890e-459c-4673-1ca1dea64f00/public',
  coinGeckoId: 'injective-protocol',
  denom: IS_TESTNET
    ? 'peggy0x5512c04B6FF813f3571bDF64A1d74c98B5257332'
    : 'peggy0xe28b3b32b6c345a34ff64674606124dd5aceca30',
  tokenType: TokenType.Erc20,
  externalLogo: 'injective-v3.png'
}
