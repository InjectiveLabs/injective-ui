/**
 * SDK API Factory Functions
 *
 * This module provides lazy-loaded, cached factory functions for SDK API clients.
 * Each function imports only the specific subpath needed, enabling better tree-shaking
 * and smaller bundle sizes compared to importing from the barrel export.
 *
 * Usage:
 *   const bankApi = await getChainGrpcBankApi(endpoint)
 *   const balance = await bankApi.fetchBalance(...)
 */

// Shared cache for all API instances
const apiCache = new Map<string, unknown>()

/**
 * Creates a cached factory function for an SDK API class.
 *
 * @param className - The name of the API class (used for cache key)
 * @param importFn - Function that dynamically imports and returns the API class
 * @returns A factory function that returns a cached instance of the API
 */
function createApiFactory<T>(
  className: string,
  importFn: () => Promise<new (endpoint: string) => T>
): (endpoint: string) => Promise<T> {
  return async (endpoint: string) => {
    const key = `${className}-${endpoint}`

    if (apiCache.has(key)) {
      return apiCache.get(key) as T
    }

    const ApiClass = await importFn()
    const instance = new ApiClass(endpoint)
    apiCache.set(key, instance)

    return instance
  }
}

// ============================================================
// Chain gRPC API Factories
// ============================================================

export const getChainGrpcBankApi = createApiFactory(
  'ChainGrpcBankApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/chain')).ChainGrpcBankApi
)

export const getChainGrpcIbcApi = createApiFactory(
  'ChainGrpcIbcApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/chain')).ChainGrpcIbcApi
)

export const getChainGrpcMintApi = createApiFactory(
  'ChainGrpcMintApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/chain')).ChainGrpcMintApi
)

export const getChainGrpcWasmApi = createApiFactory(
  'ChainGrpcWasmApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/chain')).ChainGrpcWasmApi
)

export const getChainGrpcTokenFactoryApi = createApiFactory(
  'ChainGrpcTokenFactoryApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/chain'))
      .ChainGrpcTokenFactoryApi
)

export const getChainGrpcStakingApi = createApiFactory(
  'ChainGrpcStakingApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/chain')).ChainGrpcStakingApi
)

export const getChainGrpcExchangeApi = createApiFactory(
  'ChainGrpcExchangeApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/chain')).ChainGrpcExchangeApi
)

export const getChainGrpcDistributionApi = createApiFactory(
  'ChainGrpcDistributionApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/chain'))
      .ChainGrpcDistributionApi
)

export const getChainGrpcInsuranceFundApi = createApiFactory(
  'ChainGrpcInsuranceFundApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/chain'))
      .ChainGrpcInsuranceFundApi
)

export const getChainGrpcOracleApi = createApiFactory(
  'ChainGrpcOracleApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/chain')).ChainGrpcOracleApi
)

export const getChainGrpcGovApi = createApiFactory(
  'ChainGrpcGovApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/chain')).ChainGrpcGovApi
)

export const getChainGrpcAuctionApi = createApiFactory(
  'ChainGrpcAuctionApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/chain')).ChainGrpcAuctionApi
)

export const getChainGrpcPeggyApi = createApiFactory(
  'ChainGrpcPeggyApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/chain')).ChainGrpcPeggyApi
)

export const getChainGrpcTendermintApi = createApiFactory(
  'ChainGrpcTendermintApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/chain')).ChainGrpcTendermintApi
)

export const getChainRestAuthApi = createApiFactory(
  'ChainRestAuthApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/chain')).ChainRestAuthApi
)

export const getChainRestWasmApi = createApiFactory(
  'ChainRestWasmApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/chain')).ChainRestWasmApi
)

// ============================================================
// Indexer gRPC API Factories
// ============================================================

export const getIndexerGrpcMitoApi = createApiFactory(
  'IndexerGrpcMitoApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/indexer')).IndexerGrpcMitoApi
)

export const getIndexerGrpcSpotApi = createApiFactory(
  'IndexerGrpcSpotApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/indexer')).IndexerGrpcSpotApi
)

export const getIndexerGrpcDerivativesApi = createApiFactory(
  'IndexerGrpcDerivativesApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/indexer'))
      .IndexerGrpcDerivativesApi
)

export const getIndexerGrpcAccountApi = createApiFactory(
  'IndexerGrpcAccountApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/indexer')).IndexerGrpcAccountApi
)

export const getIndexerGrpcAccountPortfolioApi = createApiFactory(
  'IndexerGrpcAccountPortfolioApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/indexer'))
      .IndexerGrpcAccountPortfolioApi
)

export const getIndexerGrpcInsuranceFundApi = createApiFactory(
  'IndexerGrpcInsuranceFundApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/indexer'))
      .IndexerGrpcInsuranceFundApi
)

export const getIndexerGrpcOracleApi = createApiFactory(
  'IndexerGrpcOracleApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/indexer')).IndexerGrpcOracleApi
)

export const getIndexerGrpcExplorerApi = createApiFactory(
  'IndexerGrpcExplorerApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/indexer'))
      .IndexerGrpcExplorerApi
)

export const getIndexerGrpcAuctionApi = createApiFactory(
  'IndexerGrpcAuctionApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/indexer')).IndexerGrpcAuctionApi
)

export const getIndexerRestExplorerApi = createApiFactory(
  'IndexerRestExplorerApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/indexer'))
      .IndexerRestExplorerApi
)

export const getIndexerRestDerivativesChronosApi = createApiFactory(
  'IndexerRestDerivativesChronosApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/indexer'))
      .IndexerRestDerivativesChronosApi
)

export const getIndexerRestSpotChronosApi = createApiFactory(
  'IndexerRestSpotChronosApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/indexer'))
      .IndexerRestSpotChronosApi
)

export const getIndexerRestMarketChronosApi = createApiFactory(
  'IndexerRestMarketChronosApi',
  async () =>
    (await import('@injectivelabs/sdk-ts/client/indexer'))
      .IndexerRestMarketChronosApi
)

// ============================================================
// Dynamic SDK API Factory
// ============================================================

/**
 * Dynamically imports and instantiates an SDK API class by name.
 * This is useful when the class name is not known at compile time
 * or when you need to load APIs that are not covered by the static factories above.
 *
 * @param options - Configuration object
 * @param options.className - The name of the API class to import
 * @param options.endpoint - The endpoint URL for the API
 * @returns A cached instance of the API class
 *
 * @example
 * const api = await lazyImportSdkTs<IndexerGrpcCampaignApi>({
 *   className: 'IndexerGrpcCampaignApi',
 *   endpoint: 'https://api.example.com'
 * })
 */
export async function lazyImportSdkTs<T>({
  className,
  endpoint
}: {
  endpoint: string
  className: string
}): Promise<T> {
  const key = `${className}-${endpoint}`

  if (apiCache.has(key)) {
    return apiCache.get(key) as T
  }

  // Determine the import path based on the class name
  const module = await (async () => {
    if (
      className.startsWith('ChainGrpc') ||
      className.startsWith('ChainRest')
    ) {
      return import('@injectivelabs/sdk-ts/client/chain')
    }

    if (
      className.startsWith('IndexerGrpc') ||
      className.startsWith('IndexerRest')
    ) {
      return import('@injectivelabs/sdk-ts/client/indexer')
    }

    if (className.startsWith('Abacus')) {
      return import('@injectivelabs/sdk-ts/client/abacus')
    }

    // Fallback to the main package
    return import('@injectivelabs/sdk-ts')
  })()

  const ApiClass = (
    module as unknown as Record<string, new (endpoint: string) => T>
  )[className]

  if (!ApiClass) {
    throw new Error(`SDK class "${className}" not found in module`)
  }

  const instance = new ApiClass(endpoint)
  apiCache.set(key, instance)

  return instance
}
