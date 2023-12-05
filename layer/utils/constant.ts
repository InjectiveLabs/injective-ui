import { ChainId, EthereumChainId } from '@injectivelabs/ts-types'
import { getNetworkEndpoints, Network } from '@injectivelabs/networks'

export const env = {
  VITE_ENV: import.meta.env.VITE_ENV,
  VITE_NAME: import.meta.env.VITE_NAME,
  VITE_BASE_URL: import.meta.env.VITE_BASE_URL,
  VITE_NETWORK: import.meta.env.VITE_NETWORK,
  VITE_CHAIN_ID: import.meta.env.VITE_CHAIN_ID,
  VITE_ETHEREUM_CHAIN_ID: import.meta.env.VITE_ETHEREUM_CHAIN_ID,
  VITE_FEE_PAYER_PUB_KEY: import.meta.env.VITE_FEE_PAYER_PUB_KEY,
  VITE_MITO_API_ENDPOINT: import.meta.env.VITE_MITO_API_ENDPOINT as string,
  VITE_INDEXER_API_ENDPOINT: import.meta.env
    .VITE_INDEXER_API_ENDPOINT as string,
  VITE_CHRONOS_API_ENDPOINT: import.meta.env
    .VITE_CHRONOS_API_ENDPOINT as string,
  VITE_SENTRY_GRPC_ENDPOINT: import.meta.env
    .VITE_SENTRY_GRPC_ENDPOINT as string,
  VITE_SENTRY_HTTP_ENDPOINT: import.meta.env.VITE_SENTRY_HTTP_ENDPOINT as string
}

console.log({ env })

export const IS_MAINNET_STAGING: boolean = env.VITE_ENV === 'staging'
export const NETWORK: Network = (env.VITE_NETWORK as Network) || Network.Devnet
export const IS_DEVNET = [
  Network.Devnet,
  Network.Devnet1,
  Network.Local
].includes(NETWORK)
export const IS_TESTNET = [Network.Testnet, Network.TestnetSentry].includes(
  NETWORK
)

export const CHAIN_ID: ChainId = (
  env.VITE_CHAIN_ID
    ? env.VITE_CHAIN_ID
    : IS_TESTNET
    ? ChainId.Testnet
    : IS_DEVNET
    ? ChainId.Devnet
    : ChainId.Mainnet
) as ChainId

export const ETHEREUM_CHAIN_ID: EthereumChainId = env.VITE_ETHEREUM_CHAIN_ID
  ? parseInt(env.VITE_ETHEREUM_CHAIN_ID as string)
  : parseInt(
      (IS_TESTNET || IS_DEVNET
        ? EthereumChainId.Goerli
        : EthereumChainId.Mainnet
      ).toString()
    )

const endpoints = getNetworkEndpoints(NETWORK)
const endpointsNotProvided =
  !endpoints &&
  (!env.VITE_INDEXER_API_ENDPOINT ||
    !env.VITE_SENTRY_GRPC_ENDPOINT ||
    !env.VITE_SENTRY_HTTP_ENDPOINT)

if (endpointsNotProvided) {
  throw new Error(
    'You either have to provide a correct VITE_NETWORK in the .env or provide VITE_EXCHANGE_API_ENDPOINT, VITE_SENTRY_GRPC_ENDPOINT and VITE_SENTRY_HTTP_ENDPOINT'
  )
}

export const ENDPOINTS = {
  ...endpoints,
  grpc: env.VITE_SENTRY_GRPC_ENDPOINT || endpoints.grpc,
  http: env.VITE_SENTRY_HTTP_ENDPOINT || endpoints.rest,
  indexer: env.VITE_INDEXER_API_ENDPOINT || endpoints.indexer,
  chronos: env.VITE_CHRONOS_API_ENDPOINT || endpoints.chronos,
  explorer: env.VITE_CHRONOS_API_ENDPOINT || endpoints.explorer
}

export const ALCHEMY_KEY = import.meta.env.VITE_ALCHEMY_KEY
export const COINGECKO_KEY = import.meta.env.VITE_COINGECKO_KEY
export const ALCHEMY_KOVAN_KEY = import.meta.env.VITE_ALCHEMY_KOVAN_KEY
export const ALCHEMY_GOERLI_KEY = import.meta.env.VITE_ALCHEMY_GOERLI_KEY
export const EXPRESS_SERVER_API = import.meta.env
  .VITE_EXPRESS_SERVER_API as string
export const HOTJAR_KEY = import.meta.env.VITE_HOTJAR_KEY_DEV as string
export const FEE_RECIPIENT = import.meta.env.VITE_FEE_RECIPIENT as string
export const AMPLITUDE_KEY_DEV = import.meta.env
  .VITE_AMPLITUDE_KEY_DEV as string
export const AMPLITUDE_KEY_PROD = import.meta.env
  .VITE_AMPLITUDE_KEY_PROD as string
export const GOOGLE_ANALYTICS_KEY = import.meta.env
  .VITE_GOOGLE_ANALYTICS_KEY as string
export const MASTER_CONTRACT_OWNER_ADDRESS = import.meta.env
  .VITE_MASTER_CONTRACT_OWNER_ADDRESS
