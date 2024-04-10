import { BigNumberInBase } from '@injectivelabs/utils'

export * from './setup'

export const INJ_LOGO_DARK_URL =
  'https://imagedelivery.net/DYKOWp0iCc0sIkF-2e4dNw/8493baf6-e4d3-4ac6-5a3b-afe15b47ae00/public'
export const UNKNOWN_LOGO_URL =
  'https://imagedelivery.net/DYKOWp0iCc0sIkF-2e4dNw/1fb4f29a-9aed-4349-4e0b-0db6b28e7500/public'

export const INJ_DENOM = 'inj'
export const ETH_DENOM = 'peggy0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
export const USDT_DENOM = 'peggy0xdAC17F958D2ee523a2206206994597C13D831ec7'

export const ZERO_IN_BASE = new BigNumberInBase(0)
export const NUMBER_REGEX = new RegExp(/^-?(0|[1-9]\d*)?(\.\d+)?$/)
