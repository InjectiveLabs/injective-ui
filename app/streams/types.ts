export interface StreamHandlers<TResponse = any> {
  onData: (response: TResponse) => void
  onError?: (payload: { details?: any; message: string }) => void
  onConnect?: (payload: { attempt: number; isReconnect: boolean }) => void
  onDisconnect?: (payload: {
    reason: string
    attempt?: number
    willRetry: boolean
  }) => void
  onRetry?: (payload: {
    attempt: number
    delayMs: number
    nextBackoff: null | number
  }) => void
}

export enum SharedStreamKey {
  UsdcUsdPrice = 'usdc-usd-price'
}
