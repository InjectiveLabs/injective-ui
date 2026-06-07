import { GeneralException } from '@injectivelabs/exceptions'
import { MsgGrant } from '@injectivelabs/sdk-ts/core/modules'
import { isCw20ContractAddress } from '@injectivelabs/sdk-ts/utils'
import { getGenericAuthorizationFromMessageType } from '@injectivelabs/sdk-ts/core/modules'
import { getAuthZApi } from '../../service'
import type {
  ContractExecutionCompatAuthz,
  GrantAuthorizationWithDecodedAuthorization
} from '@injectivelabs/sdk-ts'
import type { AutoSign } from '../../types'

export const AUTO_SIGN_RENEWAL_THRESHOLD = 60 * 60 * 24 * 14
export const AUTO_SIGN_GRANT_DURATION = 60 * 60 * 24 * 60

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
  granter,
  messageTypes
}: {
  granter: string
  grantee?: string
  messageTypes: string[]
  grants: GrantAuthorizationWithDecodedAuthorization[]
}) {
  if (!grantee) {
    return []
  }

  const normalizedMessageTypes = messageTypes.map(normalizeMessageType)
  const nowInSeconds = Math.floor(Date.now() / 1000)

  return grants
    .filter(
      (grant) =>
        grant.granter === granter &&
        grant.grantee === grantee &&
        normalizedMessageTypes.includes(grant.authorization?.msg || '') &&
        grant.expiration > nowInSeconds + AUTO_SIGN_RENEWAL_THRESHOLD
    )
    .map((grant) => grant.expiration)
}

function getAutoSignGrantExpiration({
  grants,
  grantee,
  granter,
  messageTypes,
  renewedExpiration,
  contractEntries
}: {
  granter: string
  grantee: string
  messageTypes: string[]
  renewedExpiration?: number
  grants: GrantAuthorizationWithDecodedAuthorization[]
  contractEntries?: Array<{
    contractAddress: string
    contractMsgsType: string[]
  }>
}) {
  const contractExpirations = (contractEntries || []).flatMap(
    ({ contractAddress, contractMsgsType }) =>
      getExistingGrantExpirations({
        grants,
        granter,
        grantee: contractAddress,
        messageTypes: contractMsgsType
      })
  )

  const expirations = [
    ...getExistingGrantExpirations({
      grants,
      granter,
      grantee,
      messageTypes
    }),
    ...contractExpirations
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

  const contractEntries = Object.entries(contractMsgTypeMap || {}).map(
    ([contractAddress, contractMsgsType]) => ({
      contractAddress,
      contractMsgsType
    })
  )

  for (const { contractAddress } of contractEntries) {
    if (!isCw20ContractAddress(contractAddress)) {
      throw new GeneralException(new Error('Invalid contract addresses'))
    }
  }

  return { contractEntries }
}

function hasMissingOrExpiringGrants({
  grants,
  grantee,
  granter,
  messageTypes
}: {
  granter: string
  grantee?: string
  messageTypes: string[]
  grants: GrantAuthorizationWithDecodedAuthorization[]
}) {
  if (!grantee) {
    return true
  }

  const nowInSeconds = Math.floor(Date.now() / 1000)

  return messageTypes.some((messageType) => {
    const normalizedMessageType = normalizeMessageType(messageType)

    return !grants.some(
      (grant) =>
        grant.granter === granter &&
        grant.grantee === grantee &&
        grant.authorization?.msg === normalizedMessageType &&
        grant.expiration > nowInSeconds + AUTO_SIGN_RENEWAL_THRESHOLD
    )
  })
}

export {
  fetchGranterGrants,
  normalizeMessageType,
  getAutoSignGrantConfig,
  getMissingGrantMessages,
  fetchGranterGrantsNoThrow,
  hasMissingOrExpiringGrants,
  getAutoSignGrantExpiration,
  getExistingGrantExpirations
}
