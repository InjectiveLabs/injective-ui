import { NETWORK, IS_HELIX, IS_TRUE_CURRENT } from '../utils/constant'
import {
  PersistentTtlCache,
  createPersistentCacheKey
} from './persistentTtlCache'
import { SharedMarketStatus } from '../types'

export type BffMarketStatus = Exclude<
  SharedMarketStatus,
  typeof SharedMarketStatus.Unspecified
>

export const MARKET_DEFINITIONS_CACHE_TTL_MS = 5 * 60 * 1000
export const ALL_MARKET_STATUSES: BffMarketStatus[] = [
  SharedMarketStatus.Active,
  SharedMarketStatus.Paused,
  SharedMarketStatus.Expired,
  SharedMarketStatus.Suspended,
  SharedMarketStatus.Demolished
]

export const marketDefinitionsCache = new PersistentTtlCache({
  version: 1,
  dbName: 'injective-ui-markets',
  storeName: 'definitions'
})

export function getMarketDefinitionsCacheKey({
  marketType,
  marketStatuses
}: {
  marketType: 'spot' | 'derivative'
  marketStatuses?: BffMarketStatus[]
}) {
  return createPersistentCacheKey('market-definitions', {
    network: NETWORK,
    marketType,
    app: getMarketsCacheAppVariant(),
    marketStatuses: marketStatuses ? [...marketStatuses].sort() : ['active']
  })
}

export function shouldCacheMarketDefinitions(markets: { marketId: string }[]) {
  return markets.length > 0
}

function getMarketsCacheAppVariant() {
  if (IS_HELIX) {
    return 'helix'
  }

  if (IS_TRUE_CURRENT) {
    return 'true-current'
  }

  return 'default'
}
