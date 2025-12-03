import { FaucetService } from './app/Faucet'
import { Web3Client } from './app/Web3Client'
import { PythService } from './app/pythClient'
import { UiApiService } from '../providers/uiApi'
import { InjNameService } from './app/nameService'
import { InjBonfidaNameService } from './app/bonfida'
import { SharedTokenClient } from './app/tokenClient'
import { Web3GatewayService } from './app/Web3Gateway'
import { alchemyRpcEndpoint } from '../wallet/alchemy'
import { CachePythService } from './app/cachePythClient'
import { CoinGeckoApiService } from './app/CoinGeckoApi'
import { SpotCacheApi } from './../providers/cacheApi/spot'
import { TokenCacheApi } from './../providers/cacheApi/token'
import { StrapiCacheApi } from './../providers/cacheApi/strapi'
import { StakingCacheApi } from './../providers/cacheApi/staking'
import { TokenStaticFactory } from '@injectivelabs/sdk-ts/service'
import { TokenPrice as TokenPriceService } from './app/tokenPrice'
import { DerivativeCacheApi } from '../providers/cacheApi/derivative'
import { SharedTokenClientStatic } from '../service/app/SharedTokenClientStatic'
import {
  NETWORK,
  ENDPOINTS,
  IS_MAINNET,
  COINGECKO_KEY,
  MITO_API_ENDPOINT
} from './../utils/constant'
import {
  getChainGrpcIbcApi,
  getChainGrpcGovApi,
  getChainGrpcMintApi,
  getChainGrpcBankApi,
  getChainGrpcWasmApi,
  getChainRestAuthApi,
  getChainRestWasmApi,
  getChainGrpcPeggyApi,
  getChainGrpcOracleApi,
  getIndexerGrpcMitoApi,
  getIndexerGrpcSpotApi,
  getChainGrpcStakingApi,
  getChainGrpcAuctionApi,
  getChainGrpcExchangeApi,
  getIndexerGrpcOracleApi,
  getIndexerGrpcAccountApi,
  getIndexerGrpcAuctionApi,
  getIndexerGrpcExplorerApi,
  getChainGrpcDistributionApi,
  getChainGrpcTokenFactoryApi,
  getChainGrpcInsuranceFundApi,
  getIndexerGrpcDerivativesApi,
  getIndexerGrpcInsuranceFundApi,
  getIndexerGrpcAccountPortfolioApi,
  getIndexerRestDerivativesChronosApi,
  getIndexerRestExplorerApi as getIndexerRestExplorerApiFactory,
  getIndexerRestSpotChronosApi as getIndexerRestSpotChronosApiFactory,
  getIndexerRestMarketChronosApi as getIndexerRestMarketChronosApiFactory
} from './../utils/lib/sdkImports'

export const getBankApi = () => getChainGrpcBankApi(ENDPOINTS.grpc)

export const getIbcApi = () => getChainGrpcIbcApi(ENDPOINTS.grpc)

export const getMintApi = () => getChainGrpcMintApi(ENDPOINTS.grpc)

export const getWasmApi = () => getChainGrpcWasmApi(ENDPOINTS.grpc)

export const getTokenFactoryApi = () =>
  getChainGrpcTokenFactoryApi(ENDPOINTS.grpc)

export const getStakingApi = () => getChainGrpcStakingApi(ENDPOINTS.grpc)

export const getExchangeApi = () => getChainGrpcExchangeApi(ENDPOINTS.grpc)

export const getDistributionApi = () =>
  getChainGrpcDistributionApi(ENDPOINTS.grpc)

export const getInsuranceFundsApi = () =>
  getChainGrpcInsuranceFundApi(ENDPOINTS.grpc)

export const getOracleApi = () => getChainGrpcOracleApi(ENDPOINTS.grpc)

export const getGovernanceApi = () => getChainGrpcGovApi(ENDPOINTS.grpc)

export const getAuctionApi = () => getChainGrpcAuctionApi(ENDPOINTS.grpc)

export const getPeggyApi = () => getChainGrpcPeggyApi(ENDPOINTS.grpc)

export const getIndexerMitoApi = () => getIndexerGrpcMitoApi(MITO_API_ENDPOINT)

export const getIndexerSpotApi = () => getIndexerGrpcSpotApi(ENDPOINTS.indexer)

export const getIndexerDerivativesApi = () =>
  getIndexerGrpcDerivativesApi(ENDPOINTS.indexer)

export const getIndexerAccountApi = () =>
  getIndexerGrpcAccountApi(ENDPOINTS.indexer)

export const getIndexerAccountPortfolioApi = () =>
  getIndexerGrpcAccountPortfolioApi(ENDPOINTS.indexer)

export const getIndexerFundsApi = () =>
  getIndexerGrpcInsuranceFundApi(ENDPOINTS.indexer)

export const getIndexerOracleApi = () =>
  getIndexerGrpcOracleApi(ENDPOINTS.indexer)

export const getIndexerExplorerApi = () =>
  getIndexerGrpcExplorerApi(ENDPOINTS.indexer)

export const getRestAuthApi = () => getChainRestAuthApi(ENDPOINTS.rest)

export const getRestWasmApi = () => getChainRestWasmApi(ENDPOINTS.rest)

export const getIndexerRestExplorerApi = () =>
  getIndexerRestExplorerApiFactory(
    `${IS_MAINNET ? 'https://k8s.global.mainnet.explorer.grpc-web.injective.network' : ENDPOINTS.explorer}/api/explorer/v1`
  )

export const getIndexerRestDerivativeChronosApi = () =>
  getIndexerRestDerivativesChronosApi(
    `${ENDPOINTS.chart || ENDPOINTS.chronos}/api/chart/v1/derivative`
  )

export const getIndexerRestSpotChronosApi = () =>
  getIndexerRestSpotChronosApiFactory(
    `${ENDPOINTS.chart || ENDPOINTS.chronos}/api/chart/v1/spot`
  )

export const getIndexerRestMarketChronosApi = () =>
  getIndexerRestMarketChronosApiFactory(
    IS_MAINNET
      ? `https://k8s.global.mainnet.chart.grpc-web.injective.network/api/chart/v1/market`
      : `${ENDPOINTS.chart || ENDPOINTS.chronos}/api/chart/v1/market`
  )

export const getIndexerAuctionApi = () =>
  getIndexerGrpcAuctionApi(ENDPOINTS.indexer)

export const uiApi = new UiApiService(ENDPOINTS.uiApi)
export const spotCacheApi = new SpotCacheApi(ENDPOINTS.uiApi)
export const tokenCacheApi = new TokenCacheApi(ENDPOINTS.uiApi)
export const strapiCacheApi = new StrapiCacheApi(ENDPOINTS.uiApi)
export const stakingCacheApi = new StakingCacheApi(ENDPOINTS.uiApi)
export const derivativeCacheApi = new DerivativeCacheApi(ENDPOINTS.uiApi)

export const pythService = new PythService()
export const cachePythService = new CachePythService()

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
export const injNameService = new InjNameService()
export const injBonfidaNameService = new InjBonfidaNameService()

export const sharedTokenClient = new SharedTokenClient()
export const sharedTokenClientStatic = new SharedTokenClientStatic()

export const web3Client = new Web3Client({
  network: NETWORK,
  rpc: alchemyRpcEndpoint
})

export const faucetService = new FaucetService()
export const web3GatewayService = new Web3GatewayService()
export const tokenStaticFactory = new TokenStaticFactory([])
