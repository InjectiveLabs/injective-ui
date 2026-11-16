import { isAxiosError } from 'axios'
import { UiApiService } from '../../providers/uiApi'
import { TURNKEY_SESSION_SECONDS } from '../../utils/constant'
import { TURNKEY_API_SERVER_ENDPOINT } from '../../wallet/strategy'

const uiApi = new UiApiService(TURNKEY_API_SERVER_ENDPOINT)

type UiApiErrorBody = { statusMessage?: string; data?: { code?: string } }

type TurnkeyOidcRequest = {
  subOrgId: string
  oidcToken: string
  providerName: string
  targetPublicKey: null | string
}

function toTurnkeyRouteError(e: unknown) {
  if (!isAxiosError(e) || !e.response) {
    return e
  }

  const { data, statusMessage } = (e.response.data ?? {}) as UiApiErrorBody

  return Object.assign(new Error(statusMessage || e.message), {
    status: e.response.status,
    code: data?.code
  })
}

async function postToTurnkeyRoute<T>(endpoint: string, body: object) {
  try {
    const { data } = await uiApi.client.post<T>(endpoint, {
      ...body,
      expirationSeconds: TURNKEY_SESSION_SECONDS
    })

    return data
  } catch (e) {
    throw toTurnkeyRouteError(e)
  }
}

/** With a `subOrgId`, ui-api signs in to that account only */
export function signInToTurnkeyWithOidcToken(request: TurnkeyOidcRequest) {
  return postToTurnkeyRoute<{
    organizationId?: string
    credentialBundle?: string
  }>('turnkey/oauth', request)
}
