import { SigningKey, BaseWallet, type Eip1193Provider } from 'ethers'
import { signTypedData, SignTypedDataVersion } from '@metamask/eth-sig-util'

const SEPOLIA_CHAIN_ID = 11155111

const methodMap: Record<
  string,
  (
    params: any,
    pk: string,
    baseWallet: BaseWallet,
    provider: CustomEip1193Provider
  ) => Promise<any>
> = {
  eth_requestAccounts: async (_method, _params, _baseWallet) => {
    return [_baseWallet.address]
  },
  eth_signTypedData_v4: async (params, pk) => {
    const _pk = pk.slice(2)

    console.log('eth_signTypedData_v4', params)

    const [_address, typedData] = params

    console.log('typedData', typedData, typeof typedData)

    const typedDataObj = JSON.parse(typedData) as any

    console.log(typedDataObj)

    const { domain, types, message, primaryType } = typedDataObj

    const signature = signTypedData({
      data: { domain, message, primaryType, types },
      privateKey: Buffer.from(_pk, 'hex'),
      version: SignTypedDataVersion.V4
    })

    return signature
  },
  eth_chainId: async (_method, _params, _baseWallet, _provider) => {
    return '0x' + _provider.chainId.toString(16)
  },
  wallet_switchEthereumChain: async (
    _method,
    _params,
    _baseWallet,
    _provider
  ) => {
    const [chainId] = _params

    const chainIdObj = JSON.parse(chainId) as any

    const chainIdInt = parseInt(chainIdObj.chainId, 16)

    _provider.chainId = chainIdInt
  }
}

export class CustomEip1193Provider implements Eip1193Provider {
  isMetaMask: boolean
  chainId: number
  private baseWallet: BaseWallet | undefined
  private pk: string | undefined
  constructor(pk?: string, chainId: number = SEPOLIA_CHAIN_ID) {
    this.isMetaMask = true

    this.chainId = chainId

    if (pk) {
      this.setPrivateKey(pk)
    }

    const windowOrGlobal = typeof window !== 'undefined' ? window : globalThis as any

    windowOrGlobal.setPrivateKey = this.setPrivateKey.bind(this)
  }

  setPrivateKey(pk: string) {
    this.pk = pk
    console.log('setPrivateKey', pk)
    const signingKey = new SigningKey(pk)
    this.baseWallet = new BaseWallet(signingKey)
  }

  async request({ method, params }: { params?: any; method: string }) {
    if (!this.pk || !this.baseWallet) {
      throw new Error('Private key not set')
    }

    if (method in methodMap) {
      return methodMap[method](params, this.pk, this.baseWallet, this)
    }

    throw new Error(`Method ${method} not found`)
  }
}
