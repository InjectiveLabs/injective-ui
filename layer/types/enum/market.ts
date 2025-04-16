export enum SharedMarketChange {
  New = 'new',
  Increase = 'increase',
  Decrease = 'decrease',
  NoChange = 'no-change'
}

export enum SharedMarketStatus {
  Active = 'active',
  Paused = 'paused',
  Expired = 'expired',
  Demolished = 'demolished',
  Unspecified = 'unspecified'
}

export enum SharedMarketType {
  Spot = 'Spot',
  Futures = 'Futures',
  Favorite = 'Favorite',
  Perpetual = 'Perpetual',
  Derivative = 'Derivative',
  BinaryOptions = 'BinaryOptions'
}
