import { JSON_POLL_INTERVAL } from '../utils/constant'
import {
  PersistentTtlCache,
  createPersistentCacheKey
} from './persistentTtlCache'

type FetchCachedJsonOptions<T> = {
  path: string
  ttlMs?: number
  request: () => Promise<{ data: T }>
  shouldCacheValue?: (value: T) => boolean
}

const jsonCache = new PersistentTtlCache({
  version: 1,
  dbName: 'injective-ui-json',
  storeName: 'cdn-responses'
})

export function fetchCachedJson<T>({
  path,
  request,
  shouldCacheValue,
  ttlMs = JSON_POLL_INTERVAL
}: FetchCachedJsonOptions<T>) {
  const canCacheValue = shouldCacheValue || isDefined

  return jsonCache.cached({
    ttlMs,
    shouldCacheValue: canCacheValue,
    allowStaleOnError: true,
    key: createPersistentCacheKey('json', path),
    request: async () => {
      const response = await request()

      return response.data
    }
  })
}

function isDefined<T>(value: T) {
  return value !== undefined && value !== null
}
