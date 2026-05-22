import { getAuthZApi } from '@/service'
import { GeneralException } from '@injectivelabs/exceptions'
import { MsgGrant } from '@injectivelabs/sdk-ts/core/modules'
import { isCw20ContractAddress } from '@injectivelabs/sdk-ts/utils'
import { getGenericAuthorizationFromMessageType } from '@injectivelabs/sdk-ts/core/modules'
import type {
  ContractExecutionCompatAuthz,
  GrantAuthorizationWithDecodedAuthorization
} from '@injectivelabs/sdk-ts'
import type { AutoSign } from '../../types'

export const AUTO_SIGN_RENEWAL_THRESHOLD = 60 * 60 * 24 * 14

export type ConnectAutoSignOptions = {
  autoSign?: AutoSign
  msgsType?: string[]
  contractMsgTypeMap?: Record<string, string[]>
  existingGrants?: GrantAuthorizationWithDecodedAuthorization[]
  contractExecutionCompatAuthz?: ContractExecutionCompatAuthz[]
}

async function fetchGranterGrants(
  granter: string
): Promise<GrantAuthorizationWithDecodedAuthorization[]> {
  const authZApi = await getAuthZApi()
  const { grants } = await authZApi.fetchGranterGrants(granter, {
    limit: 1000
  })

  return grants as GrantAuthorizationWithDecodedAuthorization[]
}

async function fetchGranterGrantsNoThrow(
  granter: string
): Promise<GrantAuthorizationWithDecodedAuthorization[]> {
  try {
    const grants = await fetchGranterGrants(granter)

    return grants as GrantAuthorizationWithDecodedAuthorization[]
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return [] as GrantAuthorizationWithDecodedAuthorization[]
  }
}

function normalizeMessageType(messageType: string) {
  return messageType.startsWith('/') ? messageType : `/${messageType}`
}

function getMissingGrantMessages({
  grants,
  grantee,
  granter,
  messageTypes,
  expiryInSeconds
}: {
  granter: string
  grantee?: string
  messageTypes: string[]
  expiryInSeconds: number
  grants: GrantAuthorizationWithDecodedAuthorization[]
}) {
  if (!grantee) {
    return []
  }

  return messageTypes
    .filter((messageType) => {
      const normalizedMessageType = normalizeMessageType(messageType)

      return !grants.some(
        (grant) =>
          grant.granter === granter &&
          grant.grantee === grantee &&
          grant.authorization?.msg === normalizedMessageType &&
          grant.expiration >
            Math.floor(Date.now() / 1000) + AUTO_SIGN_RENEWAL_THRESHOLD
      )
    })
    .map((messageType) =>
      MsgGrant.fromJSON({
        grantee,
        granter,
        expiryInSeconds,
        authorization: getGenericAuthorizationFromMessageType(messageType)
      })
    )
}

function getExistingGrantExpirations({
  grants,
  grantee,
  messageTypes
}: {
  grantee?: string
  messageTypes: string[]
  grants: GrantAuthorizationWithDecodedAuthorization[]
}) {
  if (!grantee) {
    return []
  }

  const normalizedMessageTypes = messageTypes.map(normalizeMessageType)

  return grants
    .filter(
      (grant) =>
        grant.grantee === grantee &&
        normalizedMessageTypes.includes(grant.authorization?.msg || '')
    )
    .map((grant) => grant.expiration)
}

function getAutoSignGrantExpiration({
  grants,
  grantee,
  messageTypes,
  renewedExpiration,
  contractMessageTypes,
  contractGrantee
}: {
  grantee: string
  messageTypes: string[]
  contractGrantee?: string
  renewedExpiration?: number
  contractMessageTypes?: string[]
  grants: GrantAuthorizationWithDecodedAuthorization[]
}) {
  const expirations = [
    ...getExistingGrantExpirations({
      grants,
      grantee,
      messageTypes
    }),
    ...getExistingGrantExpirations({
      grants,
      grantee: contractGrantee,
      messageTypes: contractMessageTypes || []
    })
  ]

  if (renewedExpiration) {
    expirations.push(renewedExpiration)
  }

  if (expirations.length === 0) {
    return renewedExpiration || 0
  }

  return Math.min(...expirations)
}

function getAutoSignGrantConfig({
  msgsType,
  contractMsgTypeMap,
  contractExecutionCompatAuthz
}: ConnectAutoSignOptions) {
  const hasContractMsgTypes = Object.keys(contractMsgTypeMap || {}).length > 0

  if (
    (msgsType?.length || 0) === 0 &&
    !hasContractMsgTypes &&
    (contractExecutionCompatAuthz?.length || 0) === 0
  ) {
    throw new GeneralException(new Error('No messages provided'))
  }

  const contractAddress = Object.keys(contractMsgTypeMap || {})?.[0]
  const contractMsgsType = Object.values(contractMsgTypeMap || {})[0] || []

  if (contractAddress && !isCw20ContractAddress(contractAddress)) {
    throw new GeneralException(new Error('Invalid contract addresses'))
  }

  return {
    contractAddress,
    contractMsgsType
  }
}

export {
  fetchGranterGrants,
  normalizeMessageType,
  getAutoSignGrantConfig,
  getMissingGrantMessages,
  fetchGranterGrantsNoThrow,
  getAutoSignGrantExpiration,
  getExistingGrantExpirations
}
