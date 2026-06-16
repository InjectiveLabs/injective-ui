import { ENDPOINTS } from '../utils/constant'
import { getIndexerGrpcOracleApi } from '../utils/lib/sdkImports'

export const getIndexerOracleApi = () =>
  getIndexerGrpcOracleApi(ENDPOINTS.indexer)
