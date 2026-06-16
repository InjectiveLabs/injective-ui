import { NETWORK, PRODUCT } from '../utils/constant'
import { getAutoSignWalletStrategy } from './strategy'
import { Wallet } from '@injectivelabs/wallet-base/light'
import { PrivateKey } from '@injectivelabs/sdk-ts/core/accounts'
import type { AutoSign } from '../types'

const textEncoder = new TextEncoder()

const AUTO_SIGN_VERSION = 1
const AUTO_SIGN_KEY_DB = 'injective-autosign'
const AUTO_SIGN_KEY_STORE = 'keys'
const AUTO_SIGN_HKDF_INFO = 'deterministic autosign key v1'

type StoredAutoSignKey = {
  iv: Uint8Array
  version: number
  address: string
  createdAt: number
  updatedAt: number
  storageKey: string
  wrappingKey: CryptoKey
  ciphertext: ArrayBuffer
  injectiveAddress: string
}

export type AutoSignKeyMetadata = {
  version: number
  publicKey: string
  storageKey: string
  injectiveAddress: string
  isDeterministic: boolean
}

export const getAutoSignPayload = (injectiveAddress: string) =>
  `${PRODUCT} session key v1 | ${NETWORK} | ${injectiveAddress}`

export const getAutoSignStorageKey = (injectiveAddress: string) =>
  `${PRODUCT}:${NETWORK}:autosign:v${AUTO_SIGN_VERSION}:${injectiveAddress.toLowerCase()}`

export async function deriveAndStoreAutoSignKey({
  address,
  signature,
  injectiveAddress
}: {
  address: string
  signature: string
  injectiveAddress: string
}): Promise<AutoSignKeyMetadata> {
  const payload = getAutoSignPayload(injectiveAddress)
  const privateKey = await derivePrivateKey({ payload, signature })
  const privateKeyHex = privateKey.toPrivateKeyHex()
  const storageKey = getAutoSignStorageKey(injectiveAddress)

  await storePrivateKey({
    address,
    storageKey,
    privateKeyHex,
    injectiveAddress
  })

  return {
    storageKey,
    version: AUTO_SIGN_VERSION,
    isDeterministic: true,
    injectiveAddress: privateKey.toBech32(),
    publicKey: privateKey.toPublicKey().toHex()
  }
}

export async function hasAutoSignKey(storageKey?: string): Promise<boolean> {
  if (!storageKey) {
    return false
  }

  return !!(await getStoredKey(storageKey))
}

export async function clearAutoSignKey(storageKey: string) {
  if (!storageKey) {
    throw new Error('Autosign storage key is required')
  }

  const db = await openAutoSignDb()

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(AUTO_SIGN_KEY_STORE, 'readwrite')
    const store = tx.objectStore(AUTO_SIGN_KEY_STORE)

    store.delete(storageKey)

    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function withAutoSignPrivateKey<T>(
  autoSign: AutoSign,
  callback: (privateKey: string) => Promise<T>
): Promise<T> {
  const privateKey = await getPrivateKey(autoSign)
  const autoSignWalletStrategy = await getAutoSignWalletStrategy()

  await autoSignWalletStrategy.setWallet(Wallet.PrivateKeyCosmos)
  await autoSignWalletStrategy.setMetadata({
    privateKey: {
      privateKey
    }
  })

  try {
    return await callback(privateKey)
  } finally {
    await autoSignWalletStrategy.setMetadata({
      privateKey: {
        privateKey: ''
      }
    })
  }
}

async function derivePrivateKey({
  payload,
  signature
}: {
  payload: string
  signature: string
}): Promise<PrivateKey> {
  const signatureBytes = signatureToBytes(signature)
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(signatureBytes),
    'HKDF',
    false,
    ['deriveBits']
  )
  const salt = await crypto.subtle.digest(
    'SHA-256',
    textEncoder.encode(payload)
  )

  for (let index = 0; index < 10; index++) {
    const bits = await crypto.subtle.deriveBits(
      {
        salt,
        name: 'HKDF',
        hash: 'SHA-256',
        info: textEncoder.encode(`${payload}:${AUTO_SIGN_HKDF_INFO}:${index}`)
      },
      keyMaterial,
      256
    )
    const privateKeyBytes = new Uint8Array(bits)

    try {
      const privateKey = PrivateKey.fromHex(privateKeyBytes)
      privateKeyBytes.fill(0)

      return privateKey
    } catch {
      privateKeyBytes.fill(0)
    }
  }

  throw new Error('Unable to derive a valid autosign private key')
}

async function storePrivateKey({
  address,
  storageKey,
  privateKeyHex,
  injectiveAddress
}: {
  address: string
  storageKey: string
  privateKeyHex: string
  injectiveAddress: string
}) {
  const wrappingKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const privateKeyBytes = hexToBytes(privateKeyHex)
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    wrappingKey,
    toArrayBuffer(privateKeyBytes)
  )
  privateKeyBytes.fill(0)

  const now = Date.now()
  const record: StoredAutoSignKey = {
    iv,
    address,
    storageKey,
    ciphertext,
    wrappingKey,
    updatedAt: now,
    injectiveAddress,
    version: AUTO_SIGN_VERSION,
    createdAt: (await getStoredKey(storageKey))?.createdAt || now
  }

  await putStoredKey(record)
}

async function getPrivateKey(autoSign: AutoSign): Promise<string> {
  if (autoSign.privateKey) {
    return autoSign.privateKey
  }

  const record = await getStoredKey(autoSign.storageKey)

  if (!record) {
    throw new Error('Autosign trading account is not available')
  }

  const privateKeyBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(record.iv) },
    record.wrappingKey,
    record.ciphertext
  )
  const privateKeyBytes = new Uint8Array(privateKeyBuffer)
  const privateKey = bytesToHex(privateKeyBytes)
  privateKeyBytes.fill(0)

  return `0x${privateKey}`
}

async function openAutoSignDb(): Promise<IDBDatabase> {
  return await new Promise((resolve, reject) => {
    const request = indexedDB.open(AUTO_SIGN_KEY_DB, 1)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(AUTO_SIGN_KEY_STORE)) {
        db.createObjectStore(AUTO_SIGN_KEY_STORE, { keyPath: 'storageKey' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getStoredKey(
  storageKey?: string
): Promise<undefined | StoredAutoSignKey> {
  if (!storageKey) {
    return undefined
  }

  const db = await openAutoSignDb()

  return await new Promise((resolve, reject) => {
    const tx = db.transaction(AUTO_SIGN_KEY_STORE, 'readonly')
    const request = tx.objectStore(AUTO_SIGN_KEY_STORE).get(storageKey)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function putStoredKey(record: StoredAutoSignKey) {
  const db = await openAutoSignDb()

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(AUTO_SIGN_KEY_STORE, 'readwrite')

    tx.objectStore(AUTO_SIGN_KEY_STORE).put(record)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

function signatureToBytes(signature: string): Uint8Array {
  const value = signature.startsWith('0x') ? signature.slice(2) : signature

  if (/^[0-9a-fA-F]+$/.test(value) && value.length % 2 === 0) {
    return hexToBytes(value)
  }

  try {
    return Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
  } catch {
    return textEncoder.encode(signature)
  }
}

function hexToBytes(hex: string): Uint8Array {
  const normalizedHex = hex.startsWith('0x') ? hex.slice(2) : hex
  const bytes = new Uint8Array(normalizedHex.length / 2)

  for (let index = 0; index < bytes.length; index++) {
    bytes[index] = Number.parseInt(
      normalizedHex.slice(index * 2, index * 2 + 2),
      16
    )
  }

  return bytes
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer
}

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
