import { BffApi } from './app/bffApi'
import { ENDPOINTS } from '../utils/constant'

export const bffApi = new BffApi(ENDPOINTS.bffApi)
