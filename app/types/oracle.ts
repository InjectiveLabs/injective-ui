export type OraclePrice = {
  price: string
  symbol: string
  timestamp: number
  oracleType: string
}

export type OraclePriceMap = Record<string, OraclePrice>
