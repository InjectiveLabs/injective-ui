import axios, { AxiosInstance } from 'axios'
import { Pagination, TotalSupply } from '@injectivelabs/sdk-ts'
import { bankApi } from '@/Service'

export class BaseCacheApi {
  client: AxiosInstance

  constructor(url: string) {
    this.client = axios.create({ baseURL: url, timeout: 15000 })
  }
}
