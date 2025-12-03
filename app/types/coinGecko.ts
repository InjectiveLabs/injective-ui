export interface CoinGeckoCoin {
  id: string
  name: string
  symbol: string
}

export interface CoinGeckoMarketChartResponse {
  prices: number[][]
  total_volumes: number[][]
}

export interface CoinGeckoReturnObject<T> {
  data: T
  code: string
  message: string
  success: boolean
}

export interface CoinGeckoCoinResponse {
  id: string
  name: string
  symbol: string
  market_data: {
    price_change_24h: number
    price_change_percentage_24h: number
    market_cap_change_percentage_24h: number
    high_24h: {
      chf: number
      eur: number
      gbp: number
      usd: number
    }
    market_cap: {
      chf: number
      eur: number
      gbp: number
      usd: number
    }
    total_volume: {
      chf: number
      eur: number
      gbp: number
      usd: number
    }
    current_price: {
      chf: number
      eur: number
      gbp: number
      usd: number
    }
  }
}
