export const DEFAULT_RETRY_CONFIG = {
  enabled: true,
  maxAttempts: 5,
  persistent: false, // stop after 5 attempts
  maxDelayMs: 30000,
  initialDelayMs: 1000,
  backoffMultiplier: 2
}
