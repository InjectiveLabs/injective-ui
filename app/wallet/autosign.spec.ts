// @vitest-environment happy-dom

import 'fake-indexeddb/auto'
import {
  it,
  expect,
  describe,
  afterEach,
  beforeEach
} from 'vitest'
import {
  hasAutoSignKey,
  clearAutoSignKey,
  withAutoSignPrivateKey,
  deriveAndStoreAutoSignKey
} from './autosign'
import type { AutoSign } from '../types'

const DB_NAME = 'injective-autosign'
const STORE_NAME = 'keys'
const ADDRESS = '0x0000000000000000000000000000000000000001'
const INJECTIVE_ADDRESS = 'inj1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqe2hm49'
const SIGNATURE =
  '0x6b285a39a296e7e90e993d8bc3f5967888c771cd374157dfdc6bb6d43ec74bf47df04fa479da859f3be210615d3db1ac5631417301bd15ebd6ad911d0b4c8744'

describe('wallet/autosign', () => {
  beforeEach(async () => {
    await clearStoredRecords()
  })

  afterEach(async () => {
    await clearStoredRecords()
  })

  it('derives the same deterministic trading account from the same signature', async () => {
    const first = await deriveAndStoreAutoSignKey({
      address: ADDRESS,
      signature: SIGNATURE,
      injectiveAddress: INJECTIVE_ADDRESS
    })
    const firstPrivateKey = await getPrivateKey(first)

    await clearAutoSignKey(first.storageKey)

    const second = await deriveAndStoreAutoSignKey({
      address: ADDRESS,
      signature: SIGNATURE,
      injectiveAddress: INJECTIVE_ADDRESS
    })
    const secondPrivateKey = await getPrivateKey(second)

    expect((first as { privateKey?: string }).privateKey).toBeUndefined()
    expect((second as { privateKey?: string }).privateKey).toBeUndefined()
    expect(first.publicKey).toBe(second.publicKey)
    expect(first.storageKey).toBe(second.storageKey)
    expect(first.injectiveAddress).toBe(second.injectiveAddress)
    expect(firstPrivateKey).toBe(secondPrivateKey)
  })

  it('stores encrypted private key material in IndexedDB', async () => {
    const metadata = await deriveAndStoreAutoSignKey({
      address: ADDRESS,
      signature: SIGNATURE,
      injectiveAddress: INJECTIVE_ADDRESS
    })
    const privateKey = await getPrivateKey(metadata)
    const record = await getStoredRecord(metadata.storageKey)

    expect(await hasAutoSignKey(metadata.storageKey)).toBe(true)
    expect(record?.ciphertext).toBeInstanceOf(ArrayBuffer)
    expect(record?.wrappingKey.extractable).toBe(false)
    expect((metadata as { privateKey?: string }).privateKey).toBeUndefined()
    expect(bufferToHex(record!.ciphertext)).not.toContain(privateKey.slice(2))
  })
})

async function getPrivateKey(autoSign: Partial<AutoSign>) {
  return await withAutoSignPrivateKey(
    {
      duration: 60,
      expiration: 60,
      isConfirmed: true,
      injectiveAddress: '',
      ...autoSign
    },
    async (privateKey) => privateKey
  )
}

async function getStoredRecord(storageKey: string): Promise<undefined | {
  wrappingKey: CryptoKey
  ciphertext: ArrayBuffer
}> {
  const db = await openDb()

  return await new Promise((resolve, reject) => {
    const request = db
      .transaction(STORE_NAME, 'readonly')
      .objectStore(STORE_NAME)
      .get(storageKey)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const result = request.result

      db.close()
      resolve(result)
    }
  })
}

async function openDb() {
  return await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'storageKey' })
      }
    }
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function clearStoredRecords() {
  const db = await openDb()

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')

    tx.objectStore(STORE_NAME).clear()
    tx.onerror = () => reject(tx.error)
    tx.oncomplete = () => resolve()
  })

  db.close()
}

function bufferToHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}
