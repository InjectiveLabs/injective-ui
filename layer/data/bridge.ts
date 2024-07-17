import { IS_DEVNET, IS_TESTNET } from '../utils/constant'
import { Network, CosmosChannel } from '../types'

export const CosmosChainId = {
  [Network.Axelar]: 'axelar-dojo-1',
  [Network.Celestia]: 'celestia',
  [Network.CosmosHub]: 'cosmoshub-4',
  [Network.Crescent]: 'crescent-1',
  [Network.Evmos]: 'evmos_9001-2',
  [Network.Injective]: 'injective-1',
  [Network.Kava]: 'kava_2222-10',
  [Network.Kujira]: 'kaiyo-1',
  [Network.Migaloo]: 'migaloo-1',
  [Network.Noble]: 'noble-1',
  [Network.Oraichain]: 'Oraichain',
  [Network.Osmosis]: 'osmosis-1',
  [Network.Persistence]: 'core-1',
  [Network.Secret]: 'secret-4',
  [Network.Sommelier]: 'sommelier-3',
  [Network.Stride]: 'stride-1',
  [Network.CosmosHubTestnet]: 'theta-testnet-001',
  [Network.Andromeda]: 'andromeda-1',
  [Network.Saga]: 'ssc-1',
  [Network.Fetch]: 'fetchhub-4',
  [Network.EvmosTestnet]: 'evmos_9000-4',

  // networks below are disabled
  [Network.Canto]: 'canto_7700-1',
  [Network.Chihuahua]: 'chihuahua-1',
  [Network.Juno]: 'juno-1',
  [Network.Terra]: 'columbus-5'
}

export const cosmoMainnetChannel: Record<string, CosmosChannel> = {
  [Network.CosmosHub]: {
    aChainId: CosmosChainId[Network.CosmosHub],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-220',
    aToBClientId: '07-tendermint-470',
    bToAChannelId: 'channel-1',
    bToAClientId: '07-tendermint-5',
    port: 'transfer'
  },
  [Network.Osmosis]: {
    aChainId: CosmosChainId[Network.Osmosis],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-122',
    aToBClientId: '07-tendermint-1703',
    bToAChannelId: 'channel-8',
    bToAClientId: '07-tendermint-19',
    port: 'transfer'
  },
  [Network.Axelar]: {
    aChainId: CosmosChainId[Network.Axelar],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-10',
    aToBClientId: '07-tendermint-37',
    bToAChannelId: 'channel-84',
    bToAClientId: '07-tendermint-113',
    port: 'transfer'
  },
  [Network.Evmos]: {
    aChainId: CosmosChainId[Network.Evmos],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-10',
    aToBClientId: '07-tendermint-19',
    bToAChannelId: 'channel-83',
    bToAClientId: '07-tendermint-112',
    port: 'transfer'
  },
  [Network.Persistence]: {
    aChainId: CosmosChainId[Network.Persistence],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-41',
    aToBClientId: '07-tendermint-57',
    bToAChannelId: 'channel-82',
    bToAClientId: '07-tendermint-110',
    port: 'transfer'
  },
  [Network.Secret]: {
    aChainId: CosmosChainId[Network.Secret],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-23',
    aToBClientId: '07-tendermint-22',
    bToAChannelId: 'channel-88',
    bToAClientId: '07-tendermint-97',
    port: 'transfer'
  },
  [Network.Stride]: {
    aChainId: CosmosChainId[Network.Stride],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-6',
    aToBClientId: '07-tendermint-2',
    bToAChannelId: 'channel-89',
    bToAClientId: '07-tendermint-131',
    port: 'transfer'
  },
  [Network.Crescent]: {
    aChainId: CosmosChainId[Network.Crescent],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-23',
    aToBClientId: '',
    bToAChannelId: 'channel-90',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Sommelier]: {
    aChainId: CosmosChainId[Network.Sommelier],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-1',
    aToBClientId: '',
    bToAChannelId: 'channel-93',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Kava]: {
    aChainId: CosmosChainId[Network.Kava],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-122',
    aToBClientId: '',
    bToAChannelId: 'channel-143',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Oraichain]: {
    aChainId: CosmosChainId[Network.Oraichain],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-146',
    aToBClientId: '',
    bToAChannelId: 'channel-147',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Celestia]: {
    aChainId: CosmosChainId[Network.Celestia],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-7',
    aToBClientId: '',
    bToAChannelId: 'channel-152',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Migaloo]: {
    aChainId: CosmosChainId[Network.Migaloo],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-3',
    aToBClientId: '',
    bToAChannelId: 'channel-102',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Kujira]: {
    aChainId: CosmosChainId[Network.Kujira],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-54',
    aToBClientId: '',
    bToAChannelId: 'channel-98',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Andromeda]: {
    aChainId: CosmosChainId[Network.Andromeda],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-13',
    aToBClientId: '',
    bToAChannelId: 'channel-213',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Noble]: {
    aChainId: CosmosChainId[Network.Noble],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-31',
    aToBClientId: '',
    bToAChannelId: 'channel-148',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Saga]: {
    aChainId: CosmosChainId[Network.Saga],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-25',
    aToBClientId: '',
    bToAChannelId: 'channel-261',
    bToAClientId: '',
    port: 'transfer'
  },
  [Network.Fetch]: {
    aChainId: CosmosChainId[Network.Fetch],
    bChainId: CosmosChainId[Network.Injective],
    aToBChannelId: 'channel-33',
    aToBClientId: '07-tendermint-82',
    bToAChannelId: 'channel-283',
    bToAClientId: '07-tendermint-266',
    port: 'transfer'
  }
  // networks below are disabled
  // [Network.Noble]: {
  //   aChainId: CosmosChainId[Network.Noble],
  //   bChainId: CosmosChainId[Network.Injective],
  //   aToBChannelId: 'channel-31',
  //   aToBClientId: '07-tendermint-57',
  //   bToAChannelId: 'channel-148',
  //   bToAClientId: '07-tendermint-212',
  //   port: 'transfer'
  // },
  // [Network.Canto]: {
  //   aChainId: CosmosChainId[Network.Canto],
  //   bChainId: CosmosChainId[Network.Injective],
  //   aToBChannelId: 'channel-8',
  //   aToBClientId: '',
  //   bToAChannelId: 'channel-99',
  //   bToAClientId: '',
  //   port: 'transfer'
  // },
  // [Network.Chihuahua]: {
  //   aChainId: CosmosChainId[Network.Chihuahua],
  //   bChainId: CosmosChainId[Network.Injective],
  //   aToBChannelId: 'channel-12',
  //   aToBClientId: '07-tendermint-55',
  //   bToAChannelId: 'channel-76',
  //   bToAClientId: '07-tendermint-99',
  //   port: 'transfer'
  // },
  // [Network.Juno]: {
  //   aChainId: CosmosChainId[Network.Juno],
  //   bChainId: CosmosChainId[Network.Injective],
  //   aToBChannelId: 'channel-59',
  //   aToBClientId: '07-tendermint-83',
  //   bToAChannelId: 'channel-87',
  //   bToAClientId: '07-tendermint-101',
  //   port: 'transfer'
  // }
}

export const cosmosTestnetChannels: Record<string, CosmosChannel> = {
  [Network.CosmosHubTestnet]: {
    aChainId: CosmosChainId[Network.CosmosHubTestnet],
    bChainId: 'injective-888',
    aToBChannelId: 'channel-86',
    aToBClientId: '07-tendermint-107',
    bToAChannelId: 'channel-1',
    bToAClientId: '07-tendermint-1',
    port: 'transfer'
  },
    [Network.EvmosTestnet]: {
    aChainId: CosmosChainId[Network.EvmosTestnet],
    bChainId: 'injective-888',
    aToBChannelId: 'channel-243',
    aToBClientId: '',
    bToAChannelId: 'channel-76996',
    bToAClientId: '',
    port: 'transfer'
  }
}

export const cosmosChannels = IS_DEVNET
  ? {}
  : IS_TESTNET
  ? cosmosTestnetChannels
  : cosmoMainnetChannel

export const IBC_COIN_CHANNEL_IDS = Object.values(cosmosChannels).map(
  (cosmosChannel: CosmosChannel) => cosmosChannel.bToAChannelId
)

export const GATEWAY_CHANNEL_ID = 'channel-183'
