import {
  ENDPOINTS,
  MITO_API_ENDPOINT,
  EXPLORER_REST_ENDPOINT
} from '../utils/constant'
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
  getIndexerRestExplorerApiFactory(EXPLORER_REST_ENDPOINT)

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
