import { IS_PRODUCTION } from './../utils/constant'
import { HttpRestClient } from '@injectivelabs/utils'
import {
  Network, isMainnet
} from '@injectivelabs/networks'

export class Web3GatewayService {
  private restClient: HttpRestClient

  constructor(
    network: Network = Network.MainnetSentry,
  ) {

    const endpoint = isMainnet(network) && IS_PRODUCTION
      ? 'https://products.web3-gateway.injective.network/api' : ''
    
    this.restClient = new HttpRestClient(endpoint)
  }

  async healthCheck(): Promise<{ status: boolean }> {
    // todo: remove this status check before pushing to prod
    return Promise.resolve({ status: false })

    // const response = await this.restClient.get(`health/v1/status`)  as { data: { status: boolean } }

    // return response.data.status
  }
}
