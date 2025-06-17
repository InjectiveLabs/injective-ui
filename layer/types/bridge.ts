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
  XRPL = 'xrpl',
  EvmosTestnet = 'evmos-testnet',
  InjectiveDevnet = 'injective-devnet',
  InjectiveTestnet = 'injective-testnet'
}

export type CosmosChannel = {
  port: string
  aChainId: string
  bChainId: string
  aToBClientId: string
  bToAClientId: string
  aToBChannelId: string
  bToAChannelId: string
}
