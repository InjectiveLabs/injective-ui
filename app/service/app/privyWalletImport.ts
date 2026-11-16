import axios from 'axios'
import {
  PRIVY_APP_ID,
  PRIVY_CLIENT_ID,
  PRIVY_AUTH_API_URL
} from '../../utils/constant'

const privyApi = axios.create({ baseURL: PRIVY_AUTH_API_URL, timeout: 15000 })

export type PrivyWalletImport = {
  address: string
  chain_type: 'ethereum'
  encryption_type: 'HPKE'
  entropy_type: 'private-key'
}

export type PrivyWalletImportSubmission = {
  external_id: string
  wallet: {
    ciphertext: string
    encapsulated_key: string
    hpke_config: { aad: string; info: string; aead_algorithm: 'AES_GCM256' }
  } & PrivyWalletImport
}

const withPrivyHeaders = (accessToken: string) => ({
  headers: {
    'privy-app-id': PRIVY_APP_ID,
    ...(PRIVY_CLIENT_ID ? { 'privy-client-id': PRIVY_CLIENT_ID } : {}),
    Authorization: `Bearer ${accessToken}`
  }
})

export async function initPrivyWalletImport(
  wallet: PrivyWalletImport,
  accessToken: string
) {
  const { data } = await privyApi.post<{ encryption_public_key: string }>(
    'wallets/import/init',
    wallet,
    withPrivyHeaders(accessToken)
  )

  return data
}

export async function submitPrivyWalletImport(
  submission: PrivyWalletImportSubmission,
  accessToken: string
) {
  await privyApi.post(
    'wallets/import/submit',
    submission,
    withPrivyHeaders(accessToken)
  )
}
