import type { components } from './../generated/bff.generated'

export type BffSubaccountBalanceWithToken =
  components['schemas']
export type BffToken = components['schemas']['BffToken']
export type BffBalanceWithToken = components['schemas']['BffBalanceWithToken']
export type BffMarketToken = components['schemas']['BffSpotMarket']['baseToken']

export type BffSpotMarket = components['schemas']['BffHelixSpotMarket']
export type BffDerivativeMarket =
  components['schemas']['BffHelixDerivativeMarket']
