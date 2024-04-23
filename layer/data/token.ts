import {
  TokenType,
  TokenStatic,
  TokenVerification
} from '@injectivelabs/token-metadata'
import { INJ_DENOM, UNKNOWN_LOGO_URL, INJ_LOGO_URL } from './../utils/constant'

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
