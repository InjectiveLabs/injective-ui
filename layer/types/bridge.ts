export type CosmosChannel = {
  aChainId: string
  aToBChannelId: string
  aToBClientId: string
  bToAClientId: string
  bToAChannelId: string
  bChainId: string
  port: string
}

export enum Network {
  Axelar = 'axelar',
  Canto = 'canto',
  Chihuahua = 'chihuahua',
  CosmosHub = 'cosmosHub',
  Ethereum = 'ethereum',
  EthereumWh = 'ethereumWh',
  Evmos = 'evmos',
  Fetch = 'fetch',
  Injective = 'injective',
  Juno = 'juno',
  Osmosis = 'osmosis',
  Persistence = 'Persistence',
  Terra = 'terra',
  Secret = 'secret',
  Stride = 'stride',
  Crescent = 'crescent',
  Solana = 'solana',
  Sommelier = 'sommelier',
  Arbitrum = 'arbitrum',
  Polygon = 'polygon',
  Klaytn = 'klaytn',
  Sui = 'sui',
  Kava = 'kava',
  Oraichain = 'oraichain',
  Noble = 'noble',
  Celestia = 'celestia',
  Migaloo = 'migaloo',
  Kujira = 'kujira',
  CosmosHubTestnet = 'cosmosHub-testnet',
  Andromeda = 'andromeda',
  Saga = 'saga',
  Mantra = 'mantra',
  Neutron = 'neutron',
  Wormhole = 'wormhole',
  WormholeGeneric = 'wormhole-generic',
  XionTestnet = 'xion-testnet',
  Xion = 'xion',
  EvmosTestnet = 'evmos-testnet',
  InjectiveDevnet = 'injective-devnet',
  InjectiveTestnet = 'injective-testnet'
}
