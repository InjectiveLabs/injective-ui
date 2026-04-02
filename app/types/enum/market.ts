export enum SharedMarketChange {
  New = 'new',
  Increase = 'increase',
  Decrease = 'decrease',
  NoChange = 'no-change'
}

export const SharedMarketStatus = {
  Active: 'active',
  Paused: 'paused',
  Expired: 'expired',
  Suspended: 'suspended',
  Demolished: 'demolished',
  Unspecified: 'unspecified'
} as const

export type SharedMarketStatus =
  (typeof SharedMarketStatus)[keyof typeof SharedMarketStatus]

export const SharedMarketType = {
  Spot: 'spot',
  Futures: 'futures',
  Favorite: 'favorite',
  Perpetual: 'perpetual',
  Derivative: 'derivative',
  BinaryOptions: 'binaryOptions'
} as const

export type SharedMarketType =
  (typeof SharedMarketType)[keyof typeof SharedMarketType]
