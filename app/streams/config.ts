export const DEFAULT_RETRY_CONFIG = {
  enabled: true,
  maxAttempts: 5,
  persistent: false,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2
}
