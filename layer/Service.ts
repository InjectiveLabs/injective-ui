import {
  TokenPrice,
  Web3Client,
  Web3Composer,
  TokenService,
  InjNameService,
  DenomClientAsync
} from '@injectivelabs/sdk-ui-ts'
import {
  DenomClient,
  ChainGrpcMintApi,
  ChainGrpcWasmApi,
  ChainGrpcBankApi,
  ChainGrpcPeggyApi,
  IndexerGrpcSpotApi,
  ChainGrpcStakingApi,
  ChainGrpcExchangeApi,
  IndexerGrpcOracleApi,
  IndexerGrpcAccountApi,
  IndexerGrpcAuctionApi,
  IndexerRestExplorerApi,
  IndexerGrpcExplorerApi,
  ChainGrpcTokenFactoryApi,
  ChainGrpcDistributionApi,
  ChainGrpcInsuranceFundApi,
  IndexerRestSpotChronosApi,
  IndexerGrpcDerivativesApi,
  IndexerRestMarketChronosApi,
  IndexerGrpcAccountPortfolioApi,
  IndexerRestDerivativesChronosApi
} from '@injectivelabs/sdk-ts'
import { TokenMetaUtilsFactory } from '@injectivelabs/token-metadata'
import { SpotCacheApi } from './providers/cacheApi/spot'
import { TokenCacheApi } from './providers/cacheApi/token'
import { StakingCacheApi } from './providers/cacheApi/staking'
import { DerivativeCacheApi } from './providers/cacheApi/derivative'
import {
  NETWORK,
  CHAIN_ID,
  ENDPOINTS,
  COINGECKO_KEY,
  ETHEREUM_CHAIN_ID
} from './utils/constant'
import { alchemyRpcEndpoint } from './wallet/alchemy'

// Services
export const bankApi = new ChainGrpcBankApi(ENDPOINTS.grpc)
export const mintApi = new ChainGrpcMintApi(ENDPOINTS.grpc)
export const stakingApi = new ChainGrpcStakingApi(ENDPOINTS.grpc)
export const wasmApi = new ChainGrpcWasmApi(ENDPOINTS.grpc)
export const exchangeApi = new ChainGrpcExchangeApi(ENDPOINTS.grpc)
export const distributionApi = new ChainGrpcDistributionApi(ENDPOINTS.grpc)
export const insuranceFundsApi = new ChainGrpcInsuranceFundApi(ENDPOINTS.grpc)

export const peggyApi = new ChainGrpcPeggyApi(ENDPOINTS.grpc)

export const indexerSpotApi = new IndexerGrpcSpotApi(ENDPOINTS.indexer)
export const indexerAccountApi = new IndexerGrpcAccountApi(ENDPOINTS.indexer)
export const indexerDerivativesApi = new IndexerGrpcDerivativesApi(
  ENDPOINTS.indexer
)
export const indexerAccountPortfolioApi = new IndexerGrpcAccountPortfolioApi(
  ENDPOINTS.indexer
)
export const tokenFactoryApi = new ChainGrpcTokenFactoryApi(ENDPOINTS.grpc)
export const indexerOracleApi = new IndexerGrpcOracleApi(ENDPOINTS.indexer)
export const indexerExplorerApi = new IndexerGrpcExplorerApi(ENDPOINTS.indexer)
export const indexerRestExplorerApi = new IndexerRestExplorerApi(
  `${ENDPOINTS.indexer}/api/explorer/v1`
)
export const indexerRestDerivativeChronosApi =
  new IndexerRestDerivativesChronosApi(
    `${ENDPOINTS.chronos}/api/chronos/v1/derivative`
  )
export const indexerRestSpotChronosApi = new IndexerRestSpotChronosApi(
  `${ENDPOINTS.chronos}/api/chronos/v1/spot`
)

export const indexerRestMarketChronosApi = new IndexerRestMarketChronosApi(
  `${ENDPOINTS.chronos}/api/chronos/v1/market`
)

export const indexerAuctionApi = new IndexerGrpcAuctionApi(ENDPOINTS.indexer)
export const spotCacheApi = new SpotCacheApi(ENDPOINTS.cacheRest)
export const tokenCacheApi = new TokenCacheApi(ENDPOINTS.cacheRest)
export const stakingCacheApi = new StakingCacheApi(ENDPOINTS.cacheRest)
export const derivativeCacheApi = new DerivativeCacheApi(ENDPOINTS.cacheRest)

export const injNameService = new InjNameService(NETWORK)

export const denomClient = new DenomClient(NETWORK)

export const tokenService = new TokenService({
  chainId: CHAIN_ID,
  network: NETWORK
})
export const tokenPrice = new TokenPrice(NETWORK, {
  apiKey: COINGECKO_KEY as string,
  baseUrl: COINGECKO_KEY
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3'
})

export const denomClientAsync = new DenomClientAsync(NETWORK, {
  alchemyRpcUrl: alchemyRpcEndpoint
})

export const web3Client = new Web3Client({
  network: NETWORK,
  rpc: alchemyRpcEndpoint
})

export const web3Composer = new Web3Composer({
  network: NETWORK,
  rpc: alchemyRpcEndpoint,
  ethereumChainId: ETHEREUM_CHAIN_ID
})

export const tokenMetaUtils = TokenMetaUtilsFactory.make(NETWORK)
