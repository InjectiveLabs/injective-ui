export enum SharedMarketType {
  Favorite = 'Favorite',
  Spot = 'Spot',
  Derivative = 'Derivative',
  Perpetual = 'Perpetual',
  Futures = 'Futures',
  BinaryOptions = 'BinaryOptions'
}

export enum SharedMarketChange {
  New = 'new',
  NoChange = 'no-change',
  Increase = 'increase',
  Decrease = 'decrease'
}

export enum SharedMarketStatus {
  Unspecified = 'unspecified',
  Active = 'active',
  Paused = 'paused',
  Demolished = 'demolished',
  Expired = 'expired'
}
