import createClient, { type Middleware } from 'openapi-fetch'
import { createBffClient } from './../../../generated/bff-api-types'
import type { paths } from './../../../generated/bff.generated'

type ApiClient = ReturnType<typeof createClient<paths>>

export class BffApi {
  public api: ReturnType<typeof createBffClient>['api']
  private client: ApiClient

  constructor(endpoint: string) {
    // Do NOT set `credentials: 'include'` here. The BFF serves public routes
    // with `Access-Control-Allow-Origin: *` (openCors), which the browser
    // rejects in combination with credentialed requests. Auth-surface routes
    // (/authorization, /user, /profile) must opt in per-call.
    this.client = createClient<paths>({ baseUrl: endpoint })
    this.api = createBffClient(this.client).api
  }

  use(middleware: Middleware) {
    this.client.use(middleware)
  }
}
