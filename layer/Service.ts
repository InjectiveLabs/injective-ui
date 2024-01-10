import {
  TokenPrice,
  Web3Client,
  Web3Composer,
  TokenService,
  DenomClientAsync
} from '@injectivelabs/sdk-ui-ts'
import {
  DenomClient,
  ChainGrpcWasmApi,
  ChainGrpcBankApi,
  IndexerGrpcSpotApi,
  ChainGrpcExchangeApi,
  IndexerGrpcOracleApi,
  IndexerGrpcAccountApi,
  IndexerRestExplorerApi,
  IndexerGrpcExplorerApi,
  IndexerRestSpotChronosApi,
  IndexerGrpcDerivativesApi,
  IndexerGrpcAccountPortfolioApi,
  IndexerRestDerivativesChronosApi,
  ChainGrpcStakingApi
} from '@injectivelabs/sdk-ts'
import { TokenMetaUtilsFactory } from '@injectivelabs/token-metadata'
import { MsgBroadcaster, Web3Broadcaster } from '@injectivelabs/wallet-ts'
import { SpotCacheApi } from './providers/cacheApi/spot'
import { TokenCacheApi } from './providers/cacheApi/token'
import { DerivativeCacheApi } from './providers/cacheApi/derivative'
import { walletStrategy, alchemyRpcEndpoint } from './wallet/wallet-strategy'
import {
  NETWORK,
  CHAIN_ID,
  ENDPOINTS,
  COINGECKO_KEY,
  ETHEREUM_CHAIN_ID,
  FEE_PAYER_PUB_KEY
} from './utils/constant'

// Services
export const bankApi = new ChainGrpcBankApi(ENDPOINTS.grpc)
export const stakingApi = new ChainGrpcStakingApi(ENDPOINTS.grpc)
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

export const spotCacheApi = new SpotCacheApi(ENDPOINTS.cache)
export const tokenCacheApi = new TokenCacheApi(ENDPOINTS.cache)
export const derivativeCacheApi = new DerivativeCacheApi(ENDPOINTS.cache)

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

// Transaction broadcaster
export const msgBroadcaster = new MsgBroadcaster({
  walletStrategy,
  network: NETWORK,
  networkEndpoints: ENDPOINTS,
  feePayerPubKey: FEE_PAYER_PUB_KEY,
  simulateTx: true
})

export const web3Broadcaster = new Web3Broadcaster({
  walletStrategy,
  network: NETWORK,
  ethereumChainId: ETHEREUM_CHAIN_ID
})

export const tokenMetaUtils = TokenMetaUtilsFactory.make(NETWORK)
