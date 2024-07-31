import {
  ChainGrpcGovApi,
  ChainGrpcIbcApi,
  ChainGrpcMintApi,
  ChainGrpcWasmApi,
  ChainGrpcBankApi,
  ChainGrpcPeggyApi,
  IndexerGrpcMitoApi,
  IndexerGrpcSpotApi,
  ChainGrpcOracleApi,
  ChainGrpcAuctionApi,
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
  IndexerGrpcInsuranceFundApi,
  IndexerRestMarketChronosApi,
  IndexerGrpcAccountPortfolioApi,
  IndexerRestDerivativesChronosApi
} from '@injectivelabs/sdk-ts'
import { Alchemy, Network as AlchemyNetwork } from 'alchemy-sdk'
import {
  NETWORK,
  ENDPOINTS,
  IS_MAINNET,
  ALCHEMY_KEY,
  COINGECKO_KEY,
  MITO_API_ENDPOINT,
  ALCHEMY_SEPOLIA_KEY
} from './utils/constant'
import { InjNameService } from './services/nameService'
import { InjBonfidaNameService } from './services/bonfida'
import { SpotCacheApi } from './providers/cacheApi/spot'
import { SharedTokenClient } from './services/tokenClient'
import { TokenCacheApi } from './providers/cacheApi/token'
import { CoinGeckoApiService } from './services/CoinGeckoApi'
import { StakingCacheApi } from './providers/cacheApi/staking'
import { DerivativeCacheApi } from './providers/cacheApi/derivative'
import { TokenPrice as TokenPriceService } from './services/tokenPrice'
import { PythService } from './services/pythClient'
import { Web3Client } from './services/Web3Client'
import { alchemyRpcEndpoint } from './wallet/alchemy'

// Services
export const ibcApi = new ChainGrpcIbcApi(ENDPOINTS.grpc)
export const bankApi = new ChainGrpcBankApi(ENDPOINTS.grpc)
export const mintApi = new ChainGrpcMintApi(ENDPOINTS.grpc)
export const wasmApi = new ChainGrpcWasmApi(ENDPOINTS.grpc)
export const stakingApi = new ChainGrpcStakingApi(ENDPOINTS.grpc)
export const exchangeApi = new ChainGrpcExchangeApi(ENDPOINTS.grpc)
export const distributionApi = new ChainGrpcDistributionApi(ENDPOINTS.grpc)
export const insuranceFundsApi = new ChainGrpcInsuranceFundApi(ENDPOINTS.grpc)
export const oracleApi = new ChainGrpcOracleApi(ENDPOINTS.grpc)
export const governanceApi = new ChainGrpcGovApi(ENDPOINTS.grpc)
export const auctionApi = new ChainGrpcAuctionApi(ENDPOINTS.grpc)
export const mitoApi = new IndexerGrpcMitoApi(MITO_API_ENDPOINT)

export const peggyApi = new ChainGrpcPeggyApi(ENDPOINTS.grpc)

export const indexerSpotApi = new IndexerGrpcSpotApi(ENDPOINTS.indexer)
export const indexerAccountApi = new IndexerGrpcAccountApi(ENDPOINTS.indexer)
export const indexerDerivativesApi = new IndexerGrpcDerivativesApi(
  ENDPOINTS.indexer
)
export const indexerAccountPortfolioApi = new IndexerGrpcAccountPortfolioApi(
  ENDPOINTS.indexer
)
export const indexerFundsApi = new IndexerGrpcInsuranceFundApi(
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

export const pythService = new PythService()

export const tokenPriceService = new TokenPriceService(NETWORK, {
  apiKey: COINGECKO_KEY as string,
  baseUrl: COINGECKO_KEY
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3'
})

export const coinGeckoApi = new CoinGeckoApiService({
  apiKey: COINGECKO_KEY as string,
  baseUrl: COINGECKO_KEY
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3'
})

// name service
export const injNameService = new InjNameService(NETWORK)
export const injBonfidaNameService = new InjBonfidaNameService(NETWORK)

export const sharedTokenClient = new SharedTokenClient()

export const alchemyClient = IS_MAINNET
  ? new Alchemy({
      apiKey: ALCHEMY_KEY,
      network: AlchemyNetwork.ETH_MAINNET
    })
  : new Alchemy({
      apiKey: ALCHEMY_SEPOLIA_KEY,
      network: AlchemyNetwork.ETH_SEPOLIA
    })

export const web3Client = new Web3Client({
  network: NETWORK,
  rpc: alchemyRpcEndpoint
})
