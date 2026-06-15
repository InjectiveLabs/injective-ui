import { ENDPOINTS } from '../utils/constant'
import { getIndexerGrpcDerivativesApi } from '../utils/lib/sdkImports'

export const getIndexerDerivativesApi = () =>
  getIndexerGrpcDerivativesApi(ENDPOINTS.indexer)
