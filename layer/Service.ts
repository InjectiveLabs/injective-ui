import { TokenPrice, TokenService } from '@injectivelabs/sdk-ui-ts'
import {
  DenomClient,
  ChainGrpcWasmApi,
  ChainGrpcBankApi,
  IndexerGrpcSpotApi,
  ChainGrpcExchangeApi,
  IndexerGrpcOracleApi,
  IndexerGrpcAccountApi,
  IndexerRestExplorerApi,
  IndexerRestSpotChronosApi,
  IndexerGrpcDerivativesApi,
  IndexerGrpcAccountPortfolioApi
} from '@injectivelabs/sdk-ts'
import { NETWORK, CHAIN_ID, ENDPOINTS, COINGECKO_KEY } from './utils/constant'

// Services
export const bankApi = new ChainGrpcBankApi(ENDPOINTS.grpc)
export const wasmApi = new ChainGrpcWasmApi(ENDPOINTS.grpc)
export const exchangeApi = new ChainGrpcExchangeApi(ENDPOINTS.grpc)

export const indexerSpotApi = new IndexerGrpcSpotApi(ENDPOINTS.indexer)
export const indexerAccountApi = new IndexerGrpcAccountApi(ENDPOINTS.indexer)
export const indexerDerivativesApi = new IndexerGrpcDerivativesApi(
  ENDPOINTS.indexer
)
export const indexerAccountPortfolioApi = new IndexerGrpcAccountPortfolioApi(
  ENDPOINTS.indexer
)
export const indexerOracleApi = new IndexerGrpcOracleApi(ENDPOINTS.indexer)
export const indexerRestExplorerApi = new IndexerRestExplorerApi(
  `${ENDPOINTS.indexer}/api/explorer/v1`
)
export const indexerRestSpotChronosApi = new IndexerRestSpotChronosApi(
  `${ENDPOINTS.chronos}/api/chronos/v1/spot`
)
export const denomClient = new DenomClient(NETWORK)

export const tokenService = new TokenService({
  chainId: CHAIN_ID,
  network: NETWORK
})
export const tokenPrice = new TokenPrice({
  apiKey: COINGECKO_KEY as string,
  baseUrl: COINGECKO_KEY
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3'
})
