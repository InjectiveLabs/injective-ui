import createClient from 'openapi-fetch'
import { createBffClient } from './../../../generated/bff-api-types'
import type { paths } from './../../../generated/bff.generated'

type ApiClient = ReturnType<typeof createClient<paths>>

export class BffApi {
  public api: ReturnType<typeof createBffClient>['api']
  private client: ApiClient

  constructor(endpoint: string) {
    this.client = createClient<paths>({ baseUrl: endpoint })
    this.api = createBffClient(this.client).api
  }
}
