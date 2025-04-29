import { nameToNode, normalizeName } from './utils'
import { GeneralException } from '@injectivelabs/exceptions'
import {
  QueryInjName,
  ChainGrpcWasmApi,
  QueryResolverAddress,
  QueryInjectiveAddress,
  InjNameServiceQueryTransformer
} from '@injectivelabs/sdk-ts'
import {
  Network,
  getNetworkEndpoints,
  getInjNameRegistryContractForNetwork,
  getInjNameReverseResolverContractForNetwork
} from '@injectivelabs/networks'
import type {
  NetworkEndpoints} from '@injectivelabs/networks';

export class InjNameService {
  protected client: ChainGrpcWasmApi

  private reverseResolverAddress: string

  private registryAddress: string

  constructor(
    network: Network = Network.MainnetSentry,
    endpoints?: NetworkEndpoints
  ) {
    const networkEndpoints = endpoints || getNetworkEndpoints(network)

    this.client = new ChainGrpcWasmApi(networkEndpoints.grpc)
    this.registryAddress = getInjNameRegistryContractForNetwork(network)
    this.reverseResolverAddress =
      getInjNameReverseResolverContractForNetwork(network)
  }

  async fetchInjName(address: string) {
    const query = new QueryInjName({ address }).toPayload()

    const response = await this.client.fetchSmartContractState(
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
    const node = nameToNode(normalizeName(name))

    if (!node) {
      throw new GeneralException(new Error(`The ${name} can't be normalized`))
    }

    const resolverAddress = await this.fetchResolverAddress(node)

    if (!resolverAddress) {
      throw new GeneralException(new Error(`Resolver address not found`))
    }

    const query = new QueryInjectiveAddress({ node }).toPayload()

    const response = await this.client.fetchSmartContractState(
      resolverAddress,
      query
    )

    return InjNameServiceQueryTransformer.injectiveAddressResponseToInjectiveAddress(
      response
    )
  }

  private async fetchResolverAddress(node: number[]) {
    const query = new QueryResolverAddress({ node }).toPayload()

    const response = await this.client.fetchSmartContractState(
      this.registryAddress,
      query
    )

    return InjNameServiceQueryTransformer.resolverAddressResponseToResolverAddress(
      response
    )
  }
}
