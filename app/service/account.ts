import { ENDPOINTS } from '../utils/constant'
import {
  getIndexerGrpcAccountApi,
  getIndexerGrpcAccountPortfolioApi
} from '../utils/lib/sdkImports'

export const getIndexerAccountApi = () =>
  getIndexerGrpcAccountApi(ENDPOINTS.indexer)

export const getIndexerAccountPortfolioApi = () =>
  getIndexerGrpcAccountPortfolioApi(ENDPOINTS.indexer)
