export enum SharedMarketChange {
  New = 'new',
  Increase = 'increase',
  Decrease = 'decrease',
  NoChange = 'no-change'
}

export enum SharedMarketStatus {
  Active = 'Active',
  Paused = 'Paused',
  Expired = 'Expired',
  Demolished = 'Demolished',
  Unspecified = 'Unspecified'
}

export enum SharedMarketType {
  Spot = 'Spot',
  Futures = 'Futures',
  Favorite = 'Favorite',
  Perpetual = 'Perpetual',
  Derivative = 'Derivative',
  BinaryOptions = 'BinaryOptions'
}
