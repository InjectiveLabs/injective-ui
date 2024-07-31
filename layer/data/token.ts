import {
  TokenType,
  TokenStatic,
  TokenVerification
} from '@injectivelabs/sdk-ts'
import {
  INJ_DENOM,
  IS_TESTNET,
  INJ_LOGO_URL,
  USDT_LOGO_URL,
  UNKNOWN_LOGO_URL
} from './../utils/constant'

export const stableCoinSymbols = ['USDT', 'USDC', 'USDCet']

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
