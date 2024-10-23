import {
  BigNumber,
  BigNumberInWei,
  BigNumberInBase
} from '@injectivelabs/utils'

export * from './setup'

export const INJ_LOGO_URL =
  'https://imagedelivery.net/lPzngbR8EltRfBOi_WYaXw/18984c0b-3e61-431d-241d-dfbb60b57600/public'
export const INJ_LOGO_DARK_URL =
  'https://imagedelivery.net/lPzngbR8EltRfBOi_WYaXw/60aee853-77a2-40b1-04bd-b4aba9312000/public'
export const USDT_LOGO_URL =
  'https://imagedelivery.net/lPzngbR8EltRfBOi_WYaXw/a0bd252b-1005-47ef-d209-7c1c4a3cbf00/public'
export const UNKNOWN_LOGO_URL =
  'https://imagedelivery.net/lPzngbR8EltRfBOi_WYaXw/6f015260-c589-499f-b692-a57964af9900/public'

export const INJ_DENOM = 'inj'
export const ETH_DENOM = 'peggy0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
export const USDT_DENOM = 'peggy0xdAC17F958D2ee523a2206206994597C13D831ec7'
export const BINANCE_DEPOSIT_ADDRESS =
  'inj1u2rajhqtptzvu23leheta9yg99k3hazf4waf43'

export const ZERO_IN_WEI: BigNumberInWei = new BigNumberInWei(0)
export const ZERO_IN_BASE: BigNumberInBase = new BigNumberInBase(0)
// eslint-disable-next-line  prefer-regex-literals
export const NUMBER_REGEX = new RegExp(/^-?(0|[1-9]\d*)?(\.\d+)?$/)

export const GWEI_IN_WEI: BigNumber = new BigNumber(1000000000)
export const DEFAULT_GAS_PRICE = new BigNumber(120).times(GWEI_IN_WEI)
export const DEFAULT_MAINNET_GAS_PRICE = new BigNumber(30).times(GWEI_IN_WEI)
export const INJ_REQUIRED_FOR_GAS = 0.005

export const UTC_TIMEZONE = 'Etc/Greenwich'
