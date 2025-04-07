export type JsonValidator = {
  moniker: string
  identity: string
  operatorAddress: string
  image: string
}

export type JsonGridMarket = {
  slug: string
  contractAddress: string
}

export type JsonSlugMarketId = {
  slug: string
  marketId: string
}

export type JsonHelixCategory = {
  newMarkets: JsonSlugMarketId[]
  iAssets: JsonSlugMarketId[]
  rwa: JsonSlugMarketId[]
  deprecated: JsonSlugMarketId[]
  trending: JsonSlugMarketId[]
  injective: JsonSlugMarketId[]
  layer1: JsonSlugMarketId[]
  layer2: JsonSlugMarketId[]
  defi: JsonSlugMarketId[]
  ai: JsonSlugMarketId[]
  meme: JsonSlugMarketId[]
}

export type JsonSwapRoute = {
  steps: string[]
  source_denom: string
  target_denom: string
}
