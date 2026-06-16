import {
  createStore,
  get as getIdbValue,
  set as setIdbValue,
  del as deleteIdbValue
} from 'idb-keyval'

type PersistentTtlCacheEntry<T> = {
  value: T
  version: number
  expiresAt: number
}

type PersistentTtlCacheOptions = {
  version: number
  dbName?: string
  now?: () => number
  storeName?: string
  localStoragePrefix?: string
}

type PersistentTtlCacheRequestOptions<T> = {
  key: string
  ttlMs: number
  request: () => Promise<T>
  allowStaleOnError?: boolean
  shouldCacheValue?: (value: T) => boolean
}

export type PersistentTtlCacheKeyValue =
  | null
  | Date
  | string
  | number
  | boolean
  | undefined
  | PersistentTtlCacheKeyValue[]
  | { [key: string]: PersistentTtlCacheKeyValue }

type IdbStorage = {
  delete: (key: string) => Promise<void>
  get: <T>(key: string) => Promise<undefined | PersistentTtlCacheEntry<T>>
  set: <T>(key: string, entry: PersistentTtlCacheEntry<T>) => Promise<void>
}

type IdbStore = ReturnType<typeof createStore>

const DEFAULT_DB_NAME = 'injective-ui'
const DEFAULT_STORE_NAME = 'persistent-ttl-cache'

export class PersistentTtlCache {
  #pendingRequests = new Map<string, Promise<unknown>>()
  #idbStoragePromise?: Promise<undefined | IdbStorage>
  #localStoragePrefix: string
  #now: () => number
  #storeName: string
  #version: number
  #dbName: string

  constructor(options: PersistentTtlCacheOptions) {
    this.#version = options.version
    this.#now = options.now || Date.now
    this.#dbName = options.dbName || DEFAULT_DB_NAME
    this.#storeName = options.storeName || DEFAULT_STORE_NAME
    this.#localStoragePrefix =
      options.localStoragePrefix || `${this.#dbName}:${this.#storeName}`
  }

  async cached<T>({
    key,
    ttlMs,
    request,
    shouldCacheValue,
    allowStaleOnError = false
  }: PersistentTtlCacheRequestOptions<T>) {
    const cachedEntry = await this.#getEntry<T>(key)

    if (this.#isFreshEntry(cachedEntry)) {
      return cachedEntry.value
    }

    const pendingRequest = this.#pendingRequests.get(key) as
      | undefined
      | Promise<T>

    if (pendingRequest) {
      return pendingRequest
    }

    return this.#startRequest({
      key,
      ttlMs,
      request,
      cachedEntry,
      shouldCacheValue,
      allowStaleOnError
    })
  }

  async set<T>(key: string, value: T, ttlMs: number) {
    if (ttlMs <= 0) {
      await this.delete(key)

      return
    }

    await this.#setEntry(key, {
      value,
      version: this.#version,
      expiresAt: this.#now() + ttlMs
    })
  }

  async get<T>(key: string) {
    const entry = await this.#getEntry<T>(key)

    if (!this.#isFreshEntry(entry)) {
      await this.delete(key)

      return undefined
    }

    return entry.value
  }

  async delete(key: string) {
    const idbStorage = await this.#getIdbStorage()

    await idbStorage?.delete(key).catch(() => undefined)
    this.#deleteLocalStorageEntry(key)
  }

  async #startRequest<T>({
    key,
    ttlMs,
    request,
    cachedEntry,
    shouldCacheValue,
    allowStaleOnError
  }: {
    cachedEntry?: PersistentTtlCacheEntry<T>
  } & PersistentTtlCacheRequestOptions<T>) {
    const pendingRequest = Promise.resolve()
      .then(request)
      .then(async (value) => {
        if (!shouldCacheValue || shouldCacheValue(value)) {
          await this.set(key, value, ttlMs)
        }

        return value
      })
      .catch((error) => {
        if (allowStaleOnError && cachedEntry) {
          return cachedEntry.value
        }

        throw error
      })
      .finally(() => {
        if (this.#pendingRequests.get(key) === pendingRequest) {
          this.#pendingRequests.delete(key)
        }
      })

    this.#pendingRequests.set(key, pendingRequest)

    return pendingRequest
  }

  #getLocalStorageEntry<T>(key: string) {
    const storage = getLocalStorage()

    if (!storage) {
      return undefined
    }

    const storageKey = this.#getLocalStorageKey(key)
    const rawValue = storage.getItem(storageKey)

    if (!rawValue) {
      return undefined
    }

    try {
      const entry = JSON.parse(rawValue) as unknown

      if (isPersistentTtlCacheEntry<T>(entry)) {
        return entry
      }
    } catch {
      storage.removeItem(storageKey)
    }

    return undefined
  }

  async #createIdbStorage(): Promise<undefined | IdbStorage> {
    if (typeof indexedDB === 'undefined') {
      return undefined
    }

    try {
      const store = createStore(this.#dbName, this.#storeName)

      return {
        get: (key) => getIdbValue(key, store as IdbStore),
        set: (key, entry) => setIdbValue(key, entry, store as IdbStore),
        delete: (key) => deleteIdbValue(key, store as IdbStore)
      }
    } catch {
      return undefined
    }
  }

  async #setEntry<T>(key: string, entry: PersistentTtlCacheEntry<T>) {
    const idbStorage = await this.#getIdbStorage()

    if (idbStorage) {
      const hasStoredEntry = await idbStorage
        .set(key, entry)
        .then(() => true)
        .catch(() => false)

      if (hasStoredEntry) {
        return
      }
    }

    this.#setLocalStorageEntry(key, entry)
  }

  async #readEntry<T>(key: string) {
    const idbStorage = await this.#getIdbStorage()

    if (idbStorage) {
      const entry = await idbStorage.get<T>(key).catch(() => undefined)

      if (entry && isPersistentTtlCacheEntry<T>(entry)) {
        return entry
      }
    }

    return this.#getLocalStorageEntry<T>(key)
  }

  #setLocalStorageEntry<T>(key: string, entry: PersistentTtlCacheEntry<T>) {
    const storage = getLocalStorage()

    if (!storage) {
      return
    }

    try {
      storage.setItem(this.#getLocalStorageKey(key), JSON.stringify(entry))
    } catch {
      return
    }
  }

  async #getEntry<T>(key: string) {
    const entry = await this.#readEntry<T>(key)

    if (!entry) {
      return undefined
    }

    if (entry.version !== this.#version) {
      await this.delete(key)

      return undefined
    }

    return entry
  }

  #deleteLocalStorageEntry(key: string) {
    const storage = getLocalStorage()

    if (!storage) {
      return
    }

    storage.removeItem(this.#getLocalStorageKey(key))
  }

  async #getIdbStorage() {
    if (!this.#idbStoragePromise) {
      this.#idbStoragePromise = this.#createIdbStorage()
    }

    return this.#idbStoragePromise
  }

  #isFreshEntry<T>(
    entry?: PersistentTtlCacheEntry<T>
  ): entry is PersistentTtlCacheEntry<T> {
    return !!entry && entry.expiresAt > this.#now()
  }

  #getLocalStorageKey(key: string) {
    return `${this.#localStoragePrefix}:${key}`
  }
}

function getLocalStorage() {
  return typeof localStorage === 'undefined' ? undefined : localStorage
}

export function createPersistentCacheKey(
  key: string,
  ...scope: PersistentTtlCacheKeyValue[]
) {
  return [key, JSON.stringify(scope.map(normalizePersistentCacheKeyValue))].join(
    ':'
  )
}

function isPersistentTtlCacheEntry<T>(
  value: unknown
): value is PersistentTtlCacheEntry<T> {
  if (!value || typeof value !== 'object') {
    return false
  }

  const entry = value as Partial<PersistentTtlCacheEntry<T>>

  return (
    'value' in entry &&
    typeof entry.version === 'number' &&
    typeof entry.expiresAt === 'number'
  )
}

function normalizePersistentCacheKeyValue(
  value: PersistentTtlCacheKeyValue
): Exclude<PersistentTtlCacheKeyValue, undefined> {
  if (value === undefined) {
    return null
  }

  if (value === null || typeof value !== 'object') {
    return value
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (Array.isArray(value)) {
    return value.map(normalizePersistentCacheKeyValue)
  }

  return Object.keys(value)
    .sort()
    .reduce(
      (normalized, key) => {
        const normalizedValue = normalizePersistentCacheKeyValue(value[key])

        if (normalizedValue === null && value[key] === undefined) {
          return normalized
        }

        normalized[key] = normalizedValue

        return normalized
      },
      {} as Record<string, Exclude<PersistentTtlCacheKeyValue, undefined>>
    )
}
