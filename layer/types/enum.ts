export enum NotificationType {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Success = 'success'
}

export enum EventBus {
  WalletConnected = 'wallet-connected'
}

export enum WalletConnectStatus {
  idle = 'Idle',
  connected = 'Connected',
  connecting = 'Connecting',
  disconnected = 'Disconnected'
}

export enum SharedAmplitudeEvent {
  Login = 'Login',
  Logout = 'Logout',
  WalletSelected = 'Wallet Selected',
}

export enum TimeDuration {
  Day = 'day',
  Hour = 'hour',
  Minute = 'minute',
  Second = 'second'
}
