// @vitest-environment happy-dom

import 'fake-indexeddb/auto'
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest'
import {
  PersistentTtlCache,
  createPersistentCacheKey
} from './persistentTtlCache'

let dbIndex = 0

describe('PersistentTtlCache', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('returns cached values before they expire', async () => {
    let now = 1000
    const cache = createCache({ now: () => now })
    const request = vi.fn().mockResolvedValue(['btc'])

    await expect(
      cache.cached({
        ttlMs: 1000,
        key: 'markets',
        request
      })
    ).resolves.toEqual(['btc'])

    now = 1500

    await expect(
      cache.cached({
        ttlMs: 1000,
        key: 'markets',
        request: vi.fn().mockResolvedValue(['eth'])
      })
    ).resolves.toEqual(['btc'])
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('refetches values after they expire', async () => {
    let now = 1000
    const cache = createCache({ now: () => now })

    await cache.set('markets', ['btc'], 1000)

    now = 2000

    await expect(
      cache.cached({
        ttlMs: 1000,
        key: 'markets',
        request: vi.fn().mockResolvedValue(['eth'])
      })
    ).resolves.toEqual(['eth'])
  })

  it('dedupes concurrent requests', async () => {
    const cache = createCache({ now: () => 1000 })
    let resolveRequest: (value: string[]) => void = () => undefined
    let resolveRequestStart: () => void = () => undefined
    const requestStarted = new Promise<void>((resolve) => {
      resolveRequestStart = resolve
    })
    const request = vi.fn(
      () => {
        resolveRequestStart()

        return new Promise<string[]>((resolve) => {
          resolveRequest = resolve
        })
      }
    )

    const firstRequest = cache.cached({
      request,
      ttlMs: 1000,
      key: 'markets'
    })
    const secondRequest = cache.cached({
      request,
      ttlMs: 1000,
      key: 'markets'
    })

    await requestStarted

    expect(request).toHaveBeenCalledTimes(1)

    resolveRequest(['btc'])

    await expect(Promise.all([firstRequest, secondRequest])).resolves.toEqual([
      ['btc'],
      ['btc']
    ])
  })

  it('returns stale values when refresh fails and stale fallback is enabled', async () => {
    let now = 1000
    const cache = createCache({ now: () => now })

    await cache.set('markets', ['btc'], 500)

    now = 2000

    await expect(
      cache.cached({
        ttlMs: 1000,
        key: 'markets',
        allowStaleOnError: true,
        request: vi.fn().mockRejectedValue(new Error('network'))
      })
    ).resolves.toEqual(['btc'])
  })

  it('does not store values rejected by the cache predicate', async () => {
    const cache = createCache({ now: () => 1000 })
    const request = vi
      .fn<() => Promise<string[]>>()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(['btc'])

    await expect(
      cache.cached({
        request,
        ttlMs: 1000,
        key: 'markets',
        shouldCacheValue: (value) => value.length > 0
      })
    ).resolves.toEqual([])

    await expect(
      cache.cached({
        request,
        ttlMs: 1000,
        key: 'markets',
        shouldCacheValue: (value) => value.length > 0
      })
    ).resolves.toEqual(['btc'])
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('uses persisted values across cache instances without requesting again', async () => {
    const dbName = getDbName()
    const firstCache = createCache({
      dbName,
      now: () => 1000
    })
    const secondCache = createCache({
      dbName,
      now: () => 1500
    })
    const request = vi.fn().mockResolvedValue(['eth'])

    await firstCache.set('markets', ['btc'], 1000)

    await expect(
      secondCache.cached({
        request,
        ttlMs: 1000,
        key: 'markets'
      })
    ).resolves.toEqual(['btc'])
    expect(request).not.toHaveBeenCalled()
  })

  it('ignores entries from older cache versions', async () => {
    const dbName = getDbName()
    const cacheV1 = createCache({
      dbName,
      version: 1,
      now: () => 1000
    })
    const cacheV2 = createCache({
      dbName,
      version: 2,
      now: () => 1000
    })

    await cacheV1.set('markets', ['btc'], 1000)

    await expect(cacheV2.get<string[]>('markets')).resolves.toBeUndefined()
  })

  it('falls back to localStorage when IndexedDB is unavailable', async () => {
    vi.stubGlobal('indexedDB', undefined)

    const cache = createCache({ now: () => 1000 })

    await cache.set('markets', ['btc'], 1000)

    expect(localStorage.length).toBe(1)
    await expect(cache.get<string[]>('markets')).resolves.toEqual(['btc'])
  })

  it('normalizes cache keys with sorted objects and undefined fields', () => {
    const firstKey = createPersistentCacheKey('markets', {
      foo: 'bar',
      nested: {
        b: true,
        a: 1,
        ignored: undefined
      }
    })
    const secondKey = createPersistentCacheKey('markets', {
      nested: {
        a: 1,
        b: true
      },
      foo: 'bar'
    })

    expect(firstKey).toBe(secondKey)
  })
})

function createCache({
  now,
  dbName = getDbName(),
  version = 1
}: {
  dbName?: string
  version?: number
  now: () => number
}) {
  return new PersistentTtlCache({
    now,
    dbName,
    version,
    storeName: 'entries',
    localStoragePrefix: dbName
  })
}

function getDbName() {
  dbIndex += 1

  return `persistent-ttl-cache-${dbIndex}`
}
