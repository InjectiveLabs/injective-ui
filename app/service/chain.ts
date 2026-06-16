import { ENDPOINTS } from '../utils/constant'
import {
  getChainGrpcIbcApi,
  getChainGrpcGovApi,
  getChainGrpcAuthApi,
  getChainGrpcMintApi,
  getChainGrpcBankApi,
  getChainGrpcWasmApi,
  getChainRestAuthApi,
  getChainRestWasmApi,
  getChainGrpcAuthZApi,
  getChainGrpcPeggyApi,
  getChainGrpcOracleApi,
  getChainGrpcStakingApi,
  getChainGrpcAuctionApi,
  getChainGrpcDistributionApi,
  getChainGrpcTokenFactoryApi,
  getChainGrpcInsuranceFundApi
} from '../utils/lib/sdkImports'

export const getAuthApi = () => getChainGrpcAuthApi(ENDPOINTS.grpc)

export const getAuthZApi = () => getChainGrpcAuthZApi(ENDPOINTS.grpc)

export const getAuctionApi = () => getChainGrpcAuctionApi(ENDPOINTS.grpc)

export const getBankApi = () => getChainGrpcBankApi(ENDPOINTS.grpc)

export const getDistributionApi = () =>
  getChainGrpcDistributionApi(ENDPOINTS.grpc)

export const getGovernanceApi = () => getChainGrpcGovApi(ENDPOINTS.grpc)

export const getIbcApi = () => getChainGrpcIbcApi(ENDPOINTS.grpc)

export const getInsuranceFundsApi = () =>
  getChainGrpcInsuranceFundApi(ENDPOINTS.grpc)

export const getMintApi = () => getChainGrpcMintApi(ENDPOINTS.grpc)

export const getOracleApi = () => getChainGrpcOracleApi(ENDPOINTS.grpc)

export const getPeggyApi = () => getChainGrpcPeggyApi(ENDPOINTS.grpc)

export const getRestAuthApi = () => getChainRestAuthApi(ENDPOINTS.rest)

export const getRestWasmApi = () => getChainRestWasmApi(ENDPOINTS.rest)

export const getStakingApi = () => getChainGrpcStakingApi(ENDPOINTS.grpc)

export const getTokenFactoryApi = () =>
  getChainGrpcTokenFactoryApi(ENDPOINTS.grpc)

export const getWasmApi = () => getChainGrpcWasmApi(ENDPOINTS.grpc)
