import { parseAbi } from 'viem'
import { getViemPublicClient } from '@injectivelabs/wallet-base'
import type { Address, PublicClient } from 'viem'
import type { EvmChainId } from '@injectivelabs/ts-types'

export const ERC20_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)'
])

export class Erc20Contract {
  private publicClient: PublicClient

  constructor(chainId: EvmChainId, rpcUrl?: string) {
    this.publicClient = getViemPublicClient(chainId, rpcUrl)
  }

  /**
   * Batch fetch token metadata using multicall (single RPC call)
   */
  async getTokenMetadata(tokenAddress: Address): Promise<{
    name: string
    symbol: string
    decimals: number
  }> {
    const results = await this.publicClient.multicall({
      contracts: [
        {
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'name'
        },
        {
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'symbol'
        },
        {
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'decimals'
        }
      ]
    })

    const [nameResult, symbolResult, decimalsResult] = results

    return {
      name: nameResult.status === 'success' ? nameResult.result : '',
      symbol: symbolResult.status === 'success' ? symbolResult.result : '',
      decimals: decimalsResult.status === 'success' ? decimalsResult.result : 18
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
    const results = await this.publicClient.multicall({
      contracts: [
        {
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [owner]
        },
        {
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [owner, spender]
        }
      ]
    })

    const [balanceResult, allowanceResult] = results

    return {
      balance: balanceResult.status === 'success' ? balanceResult.result : 0n,
      allowance:
        allowanceResult.status === 'success' ? allowanceResult.result : 0n
    }
  }

  async allowance(
    tokenAddress: Address,
    owner: Address,
    spender: Address
  ): Promise<bigint> {
    return await this.publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [owner, spender]
    })
  }

  async balanceOf(tokenAddress: Address, account: Address): Promise<bigint> {
    return await this.publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [account]
    })
  }

  async getBalance(address: Address): Promise<bigint> {
    return await this.publicClient.getBalance({ address })
  }
}
