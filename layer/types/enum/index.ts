export * from './market'

export enum NotificationType {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Success = 'success'
}

export enum EventBus {
  WalletConnected = 'wallet-connected',
  SubaccountChange = 'subaccount-change'
}

export enum WalletConnectStatus {
  idle = 'Idle',
  connected = 'Connected',
  connecting = 'Connecting',
  disconnected = 'Disconnected',
  disconnecting = 'disconnecting'
}

export enum SharedAmplitudeEvent {
  Login = 'Login',
  Logout = 'Logout',
  WalletSelected = 'Wallet Selected'
}

export enum TimeDuration {
  Day = 'day',
  Hour = 'hour',
  Minute = 'minute',
  Second = 'second'
}

export enum SharedMarketType {
  Favorite = 'Favorite',
  Spot = 'Spot',
  Derivative = 'Derivative',
  Perpetual = 'Perpetual',
  Futures = 'Futures',
  BinaryOptions = 'BinaryOptions'
}

export enum GrantDirection {
  Grantee = 'grantee',
  Granter = 'granter'
}
