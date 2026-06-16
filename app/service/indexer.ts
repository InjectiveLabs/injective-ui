import { ENDPOINTS, IS_MAINNET, MITO_API_ENDPOINT } from '../utils/constant'
import {
  getIndexerGrpcMitoApi,
  getIndexerGrpcSpotApi,
  getIndexerGrpcAuctionApi,
  getIndexerGrpcExplorerApi,
  getIndexerGrpcInsuranceFundApi,
  getIndexerRestDerivativesChronosApi,
  getIndexerRestExplorerApi as getIndexerRestExplorerApiFactory,
  getIndexerRestSpotChronosApi as getIndexerRestSpotChronosApiFactory
} from '../utils/lib/sdkImports'

export const getIndexerMitoApi = () => getIndexerGrpcMitoApi(MITO_API_ENDPOINT)

export const getIndexerSpotApi = () => getIndexerGrpcSpotApi(ENDPOINTS.indexer)

export const getIndexerFundsApi = () =>
  getIndexerGrpcInsuranceFundApi(ENDPOINTS.indexer)

export const getIndexerExplorerApi = () =>
  getIndexerGrpcExplorerApi(ENDPOINTS.indexer)

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

export const getIndexerAuctionApi = () =>
  getIndexerGrpcAuctionApi(ENDPOINTS.indexer)
