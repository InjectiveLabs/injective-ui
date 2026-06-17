import type { Address, PublicClient } from 'viem'
import type { EvmChainId } from '@injectivelabs/ts-types'

const ERC20_ABI_MESSAGES = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)'
] as const

type ParseAbi = typeof import('viem')['parseAbi']

let erc20Abi: undefined | ReturnType<ParseAbi>

const getErc20Abi = async () => {
  if (erc20Abi) {
    return erc20Abi
  }

  const { parseAbi } = await import('viem')

  erc20Abi = parseAbi(ERC20_ABI_MESSAGES)

  return erc20Abi
}

export class Erc20Contract {
  private publicClientPromise?: Promise<PublicClient>
  private chainId: EvmChainId
  private rpcUrl?: string

  constructor(chainId: EvmChainId, rpcUrl?: string) {
    this.rpcUrl = rpcUrl
    this.chainId = chainId
  }

  /**
   * Batch fetch token metadata using multicall (single RPC call)
   */
  async getTokenMetadata(tokenAddress: Address): Promise<{
    name: string
    symbol: string
    decimals: number
  }> {
    const publicClient = await this.#getPublicClient()
    const abi = await getErc20Abi()
    const results = await publicClient.multicall({
      contracts: [
        {
          address: tokenAddress,
          abi,
          functionName: 'name'
        },
        {
          address: tokenAddress,
          abi,
          functionName: 'symbol'
        },
        {
          address: tokenAddress,
          abi,
          functionName: 'decimals'
        }
      ]
    })

    const [nameResult, symbolResult, decimalsResult] = results

    return {
      name: nameResult.status === 'success' ? (nameResult.result as string) : '',
      symbol:
        symbolResult.status === 'success'
          ? (symbolResult.result as string)
          : '',
      decimals:
        decimalsResult.status === 'success'
          ? (decimalsResult.result as number)
          : 18
    }
  }

  /**
   * Batch fetch balance and allowance using multicall (single RPC call)
   */
  async balanceAndAllowance({
    tokenAddress,
    owner,
    spender
  }: {
    owner: Address
    spender: Address
    tokenAddress: Address
  }): Promise<{ balance: bigint; allowance: bigint }> {
    const publicClient = await this.#getPublicClient()
    const abi = await getErc20Abi()
    const results = await publicClient.multicall({
      contracts: [
        {
          address: tokenAddress,
          abi,
          functionName: 'balanceOf',
          args: [owner]
        },
        {
          address: tokenAddress,
          abi,
          functionName: 'allowance',
          args: [owner, spender]
        }
      ]
    })

    const [balanceResult, allowanceResult] = results

    return {
      balance:
        balanceResult.status === 'success'
          ? (balanceResult.result as bigint)
          : 0n,
      allowance:
        allowanceResult.status === 'success'
          ? (allowanceResult.result as bigint)
          : 0n
    }
  }

  async allowance(
    tokenAddress: Address,
    owner: Address,
    spender: Address
  ): Promise<bigint> {
    const publicClient = await this.#getPublicClient()
    const abi = await getErc20Abi()

    return (await publicClient.readContract({
      address: tokenAddress,
      abi,
      functionName: 'allowance',
      args: [owner, spender]
    })) as bigint
  }

  async balanceOf(tokenAddress: Address, account: Address): Promise<bigint> {
    const publicClient = await this.#getPublicClient()
    const abi = await getErc20Abi()

    return (await publicClient.readContract({
      address: tokenAddress,
      abi,
      functionName: 'balanceOf',
      args: [account]
    })) as bigint
  }

  async getBalance(address: Address): Promise<bigint> {
    const publicClient = await this.#getPublicClient()

    return await publicClient.getBalance({ address })
  }

  async #getPublicClient() {
    if (this.publicClientPromise) {
      return await this.publicClientPromise
    }

    this.publicClientPromise = import('@injectivelabs/wallet-base').then(
      ({ getViemPublicClient }) =>
        getViemPublicClient(this.chainId, this.rpcUrl) as PublicClient
    )

    return await this.publicClientPromise
  }
}
