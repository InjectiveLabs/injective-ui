import { nameToNode, normalizeName } from './utils'
import { GeneralException } from '@injectivelabs/exceptions'
import { NETWORK, ENDPOINTS } from '../../../utils/constant'
import { getChainGrpcWasmApi } from '../../../utils/lib/sdkImports'
import {
  getInjNameRegistryContractForNetwork,
  getInjNameReverseResolverContractForNetwork
} from '@injectivelabs/networks'
import {
  QueryInjName,
  QueryResolverAddress,
  QueryInjectiveAddress,
  InjNameServiceQueryTransformer
} from '@injectivelabs/sdk-ts/client/wasm'

export class InjNameService {
  private reverseResolverAddress: string

  private registryAddress: string

  constructor() {
    this.registryAddress = getInjNameRegistryContractForNetwork(NETWORK)
    this.reverseResolverAddress =
      getInjNameReverseResolverContractForNetwork(NETWORK)
  }

  async fetchInjName(address: string) {
    const client = await getChainGrpcWasmApi(ENDPOINTS.grpc)

    const query = new QueryInjName({ address }).toPayload()

    const response = await client.fetchSmartContractState(
      this.reverseResolverAddress,
      query
    )

    const name =
      InjNameServiceQueryTransformer.injectiveNameResponseToInjectiveName(
        response
      )

    if (!name) {
      throw new GeneralException(new Error(`.inj not found for ${address}`))
    }

    const addressFromName = await this.fetchInjAddress(name)

    if (addressFromName.toLowerCase() !== address.toLowerCase()) {
      throw new GeneralException(new Error(`.inj not found for ${address}`))
    }

    return name
  }

  async fetchInjAddress(name: string) {
    const client = await getChainGrpcWasmApi(ENDPOINTS.grpc)

    const node = nameToNode(normalizeName(name))

    if (!node) {
      throw new GeneralException(new Error(`The ${name} can't be normalized`))
    }

    const resolverAddress = await this.fetchResolverAddress(node)

    if (!resolverAddress) {
      throw new GeneralException(new Error(`Resolver address not found`))
    }

    const query = new QueryInjectiveAddress({ node }).toPayload()

    const response = await client.fetchSmartContractState(
      resolverAddress,
      query
    )

    return InjNameServiceQueryTransformer.injectiveAddressResponseToInjectiveAddress(
      response
    )
  }

  private async fetchResolverAddress(node: number[]) {
    const client = await getChainGrpcWasmApi(ENDPOINTS.grpc)

    const query = new QueryResolverAddress({ node }).toPayload()

    const response = await client.fetchSmartContractState(
      this.registryAddress,
      query
    )

    return InjNameServiceQueryTransformer.resolverAddressResponseToResolverAddress(
      response
    )
  }
}
