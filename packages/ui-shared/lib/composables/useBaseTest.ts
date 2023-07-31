import { Network } from '@injectivelabs/networks'
import { DenomClient } from '@injectivelabs/sdk-ts'

export default function useBaseTest() {
  const testApiCall = async (symbol: string) => {
    const { network } = useRuntimeConfig().public.base

    const denomClient = new DenomClient(network as Network)
    const tokenData = await denomClient.getTokenMetaDataBySymbol(symbol)

    return tokenData
  }

  return { testApiCall }
}
