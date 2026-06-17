import { IS_MAINNET } from './../utils/constant'
import { Network } from '@injectivelabs/networks'
import { TokenType, TokenVerification } from '@injectivelabs/sdk-ts/types/light'
import {
  INJ_DENOM,
  WINJ_DENOM,
  IS_TESTNET,
  INJ_LOGO_URL,
  AUSD_LOGO_URL,
  USDT_LOGO_URL,
  USDC_LOGO_URL,
  UNKNOWN_LOGO_URL
} from '../utils/constant'
import type { TokenStatic } from '@injectivelabs/sdk-ts'

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
  [Network.Devnet3]: '0x0AAd19327a1b90DDE4e2D12FB99Ab8ee7E4E528D',
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

export const wInjToken: TokenStatic = {
  address: WINJ_DENOM.replace('erc20:', ''),
  isNative: true,
  decimals: 18,
  symbol: 'INJ',
  name: 'Injective',
  logo: INJ_LOGO_URL,
  coinGeckoId: 'injective-protocol',
  denom: WINJ_DENOM,
  externalLogo: 'injective-v3.png',
  tokenType: TokenType.Native,
  tokenVerification: TokenVerification.Verified
}

export const ausdToken: TokenStatic = {
  address: IS_TESTNET
    ? 'factory/inj17sjeugxjurr8s36ylywrsfd6mc4tdlfdzhftc5/ausd'
    : 'factory/inj1n636d9gzrqggdk66n2f97th0x8yuhfrtx520e7/ausd',
  isNative: false,
  name: 'AUSD',
  logo: AUSD_LOGO_URL,
  symbol: 'AUSD',
  decimals: 6,
  coinGeckoId: 'agora-dollar',
  denom: IS_TESTNET
    ? 'factory/inj17sjeugxjurr8s36ylywrsfd6mc4tdlfdzhftc5/ausd'
    : 'factory/inj1n636d9gzrqggdk66n2f97th0x8yuhfrtx520e7/ausd',
  externalLogo: 'AUSD.png',
  tokenType: TokenType.TokenFactory,
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

export const usdcToken: TokenStatic = {
  address: IS_MAINNET
    ? '0xa00C59fF5a080D2b954d0c75e46E22a0c371235a'
    : IS_TESTNET
      ? '0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d'
      : '0xa00C59fF5a080D2b954d0c75e46E22a0c371235a',
  isNative: false,
  decimals: 6,
  symbol: 'USDC',
  name: 'USD Coin',
  logo: USDC_LOGO_URL,
  coinGeckoId: 'usd-coin',
  denom: IS_MAINNET
    ? 'erc20:0xa00C59fF5a080D2b954d0c75e46E22a0c371235a'
    : IS_TESTNET
      ? 'erc20:0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d'
      : 'erc20:0xa00C59fF5a080D2b954d0c75e46E22a0c371235a',
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
  logo: INJ_LOGO_URL,
  coinGeckoId: 'injective-protocol',
  denom: IS_TESTNET
    ? 'peggy0x5512c04B6FF813f3571bDF64A1d74c98B5257332'
    : 'peggy0xe28b3b32b6c345a34ff64674606124dd5aceca30',
  tokenType: TokenType.Erc20,
  externalLogo: 'injective-v3.png'
}
