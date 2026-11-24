import { isAxiosError } from 'axios'
import { UiApiService } from '../../providers/uiApi'
import {
  AUTH_UI_API_ENDPOINT,
  TURNKEY_SESSION_SECONDS
} from '../../utils/constant'
import type { PrivyMigrationStatus } from '../../types'

// Its own client: the service index would load every service into the sign-in chunk
const uiApi = new UiApiService(AUTH_UI_API_ENDPOINT)

const bearer = (accessToken: string) => ({
  headers: { Authorization: `Bearer ${accessToken}` }
})

type TurnkeyMoveCodeRequest = {
  email?: string
  isUsingIndexedDB: boolean
  targetPublicKey: null | string
}

function toMigrationError(e: unknown) {
  if (!isAxiosError(e)) {
    return e
  }

  const { error } = (e.response?.data ?? {}) as {
    error?: { code?: string; message?: string }
  }

  return Object.assign(new Error(error?.message || e.message), {
    code: error?.code,
    status: e.response?.status
  })
}

export async function fetchPrivyMigrationStatus(accessToken: string) {
  const { data } = await uiApi.client.get<PrivyMigrationStatus>(
    'privy/migration',
    bearer(accessToken)
  )

  return data
}

export async function completePrivyMigration(accessToken: string) {
  const { data } = await uiApi.client.post<PrivyMigrationStatus>(
    'privy/migration/complete',
    {},
    bearer(accessToken)
  )

  return data
}

export async function sendTurnkeyMoveCode(
  accessToken: string,
  request: TurnkeyMoveCodeRequest
) {
  try {
    const { data } = await uiApi.client.post<{
      otpId?: string
      organizationId?: string
    }>(
      'privy/migration/turnkey-code',
      { ...request, expirationSeconds: TURNKEY_SESSION_SECONDS },
      bearer(accessToken)
    )

    return data
  } catch (e) {
    throw toMigrationError(e)
  }
}
