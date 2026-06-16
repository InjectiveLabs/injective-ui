import { CoinGeckoApiService } from './app/CoinGeckoApi'
import { NETWORK, COINGECKO_KEY } from '../utils/constant'
import { TokenPrice as TokenPriceService } from './app/tokenPrice'

export const tokenPriceService = new TokenPriceService(NETWORK, {
  apiKey: COINGECKO_KEY ?? '',
  baseUrl: COINGECKO_KEY
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3'
})

export const coinGeckoApi = new CoinGeckoApiService({
  apiKey: COINGECKO_KEY ?? '',
  baseUrl: COINGECKO_KEY
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3'
})
