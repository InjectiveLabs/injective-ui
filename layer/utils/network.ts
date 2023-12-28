import { IS_DEVNET, IS_TESTNET } from './../utils/constant'

export const getHubUrl = (): string => {
  if (IS_DEVNET) {
    return 'https://devnet.hub.injective.dev'
  }

  if (IS_TESTNET) {
    return 'https://testnet.hub.injective.network'
  }

  return 'https://hub.injective.network'
}

export const getExchangeUrl = (): string => {
  if (IS_DEVNET) {
    return 'https://dev.helixapp.com'
  }

  if (IS_TESTNET) {
    return 'https://testnet.helixapp.com'
  }

  return 'https://helixapp.com'
}

export const getExplorerUrl = (): string => {
  if (IS_DEVNET) {
    return 'https://devnet.explorer.injective.dev'
  }

  if (IS_TESTNET) {
    return 'https://testnet.explorer.injective.network'
  }

  return 'https://explorer.injective.network'
}
