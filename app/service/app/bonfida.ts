import { lazyImportSdkTs } from '../../utils/lib'
import { toUtf8, toBase64 } from '@injectivelabs/sdk-ts'
import { GeneralException } from '@injectivelabs/exceptions'
import { ENDPOINTS, IS_MAINNET } from '../../utils/constant'
import type { ChainGrpcWasmApi } from '@injectivelabs/sdk-ts'

const BONFIDA_TESTNET_CONTRACT_ADDRESS =
  'inj1q79ujqyh72p43mhr2ldaly3x6d50rzp3354at3'
const BONFIDA_MAINNET_CONTRACT_ADDRESS =
  'inj1v7chmgm7vmuwldjt80utmw9c95jkrch979ps8z'

export class InjBonfidaNameService {
  async fetchInjAddress(name: string) {
    const client = await lazyImportSdkTs<ChainGrpcWasmApi>({
      endpoint: ENDPOINTS.grpc,
      className: 'ChainGrpcWasmApi'
    })

    const query = {
      resolve: {
        domain_name: name.replace('.sol', '')
      }
    }
    const response = await client.fetchSmartContractState(
      IS_MAINNET
        ? BONFIDA_MAINNET_CONTRACT_ADDRESS
        : BONFIDA_TESTNET_CONTRACT_ADDRESS,
      toBase64(query)
    )

    return toUtf8(response.data).replace(/["]/g, '')
  }

  fetchInjName(_address: string) {
    throw new GeneralException(new Error(`Not suported for this name service`))
  }
}
