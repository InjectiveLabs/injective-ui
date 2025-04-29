import { HttpRestClient } from '@injectivelabs/utils'
import {
  CHAIN_ID,
  ENDPOINTS,
} from './../utils/constant'

export class FaucetService {
  private restClient: HttpRestClient

  constructor(
  ) {
    this.restClient = new HttpRestClient(ENDPOINTS.uiApi)
  }

  async fundInjectiveAddress(injectiveAddress: string ) {
    try {
      await this.restClient.get(`v1/faucet?address=${injectiveAddress}&chainId=${CHAIN_ID}`)
    } catch (e) {
      console.log(e)
    }
  }
}
