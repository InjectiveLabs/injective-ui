import { ENDPOINTS, IS_MAINNET } from '../utils/constant'
import {
  getChainGrpcExchangeApi,
  getIndexerRestMarketChronosApi as getIndexerRestMarketChronosApiFactory
} from '../utils/lib/sdkImports'

export const getExchangeApi = () => getChainGrpcExchangeApi(ENDPOINTS.grpc)

export const getIndexerRestMarketChronosApi = () =>
  getIndexerRestMarketChronosApiFactory(
    IS_MAINNET
      ? `https://k8s.global.mainnet.chart.grpc-web.injective.network/api/chart/v1/market`
      : `${ENDPOINTS.chart || ENDPOINTS.chronos}/api/chart/v1/market`
  )
