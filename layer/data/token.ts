import {
  TokenType,
  TokenStatic,
  TokenVerification
} from '@injectivelabs/token-metadata'
import {
  INJ_DENOM,
  INJ_LOGO_URL,
  USDT_LOGO_URL,
  UNKNOWN_LOGO_URL
} from './../utils/constant'

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
  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  isNative: false,
  decimals: 6,
  symbol: 'USDT',
  name: 'Tether',
  logo: USDT_LOGO_URL,
  coinGeckoId: 'tether',
  denom: 'peggy0xdAC17F958D2ee523a2206206994597C13D831ec7',
  tokenType: TokenType.Erc20,
  tokenVerification: TokenVerification.Verified
}
