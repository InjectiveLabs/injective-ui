import { estimateGasAndNonce } from './utils'
import { WINJ_DENOM, INJECTIVE_EVM_CHAIN_ID } from './../../utils/constant'
import type { Address, PublicClient } from 'viem'
import type { EvmChainId } from '@injectivelabs/ts-types'

const WETH9_CONTRACT_ABI_MESSAGES = [
  'event Approval(address indexed src, address indexed guy, uint256 wad)',
  'event Deposit(address indexed dst, uint256 wad)',
  'event Transfer(address indexed src, address indexed dst, uint256 wad)',
  'event Withdrawal(address indexed src, uint256 wad)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address guy, uint256 wad) returns (bool)',
  'function transfer(address dst, uint256 wad) returns (bool)',
  'function transferFrom(address src, address dst, uint256 wad) returns (bool)',
  'function deposit() payable',
  'function withdraw(uint256 wad)',
  'receive() external payable'
] as const

type ParseAbi = typeof import('viem')['parseAbi']

let weth9ContractAbi: undefined | ReturnType<ParseAbi>

const getWeth9ContractAbi = async () => {
  if (weth9ContractAbi) {
    return weth9ContractAbi
  }

  const { parseAbi } = await import('viem')

  weth9ContractAbi = parseAbi(WETH9_CONTRACT_ABI_MESSAGES)

  return weth9ContractAbi
}

export class WETH9Contract {
  private publicClient?: PublicClient
  private wethAddress: Address
  private chainId: EvmChainId

  constructor(chainId: EvmChainId) {
    this.chainId = chainId
    this.wethAddress = WINJ_DENOM.replace('erc20:', '') as Address
  }

  async setTokenAllowance({
    amount,
    fromAddress,
    tokenAddress,
    spenderAddress
  }: {
    amount?: bigint
    fromAddress: Address
    tokenAddress: Address
    spenderAddress: Address
  }) {
    const abi = await getWeth9ContractAbi()
    const { toHex, maxUint256, encodeFunctionData } = await import('viem')
    const calldata = encodeFunctionData({
      abi,
      functionName: 'approve',
      args: [spenderAddress, amount ?? maxUint256]
    })

    const publicClient = await this.#getPublicClient()
    const { gas, fees, nonce } = await estimateGasAndNonce({
      value: 0n,
      calldata,
      to: tokenAddress,
      from: fromAddress,
      publicClient
    })

    const tx = {
      data: calldata,
      gas: toHex(gas),
      from: fromAddress,
      nonce: toHex(nonce),
      to: tokenAddress,
      maxFeePerGas: toHex(fees.maxFeePerGas),
      maxPriorityFeePerGas: toHex(fees.maxPriorityFeePerGas)
    }

    return tx
  }

  async transfer({
    amount,
    fromAddress,
    tokenAddress,
    toAddress
  }: {
    amount: bigint
    toAddress: Address
    fromAddress: Address
    tokenAddress: Address
  }) {
    const abi = await getWeth9ContractAbi()
    const { toHex, encodeFunctionData } = await import('viem')
    const calldata = encodeFunctionData({
      abi,
      functionName: 'transfer',
      args: [toAddress, amount]
    })

    const publicClient = await this.#getPublicClient()
    const { gas, fees, nonce } = await estimateGasAndNonce({
      value: 0n,
      calldata,
      from: fromAddress,
      to: tokenAddress,
      publicClient
    })

    const tx = {
      data: calldata,
      gas: toHex(gas),
      from: fromAddress,
      nonce: toHex(nonce),
      to: tokenAddress,
      maxFeePerGas: toHex(fees.maxFeePerGas),
      maxPriorityFeePerGas: toHex(fees.maxPriorityFeePerGas)
    }

    return tx
  }

  async deposit(amount: string, fromAddress: Address) {
    const abi = await getWeth9ContractAbi()
    const { toHex, parseEther, encodeFunctionData } = await import('viem')
    const calldata = encodeFunctionData({
      abi,
      functionName: 'deposit',
      args: []
    })

    const value = parseEther(amount)

    const publicClient = await this.#getPublicClient()
    const { gas, fees, nonce } = await estimateGasAndNonce({
      value,
      calldata,
      from: fromAddress,
      to: this.wethAddress,
      publicClient
    })

    const tx = {
      data: calldata,
      gas: toHex(gas),
      from: fromAddress,
      nonce: toHex(nonce),
      value: toHex(value),
      to: this.wethAddress,
      maxFeePerGas: toHex(fees.maxFeePerGas),
      maxPriorityFeePerGas: toHex(fees.maxPriorityFeePerGas)
    }

    return tx
  }

  async withdraw(amount: bigint, fromAddress: Address) {
    const abi = await getWeth9ContractAbi()
    const { toHex, encodeFunctionData } = await import('viem')
    const calldata = encodeFunctionData({
      abi,
      functionName: 'withdraw',
      args: [amount]
    })

    const publicClient = await this.#getPublicClient()
    const { gas, fees, nonce } = await estimateGasAndNonce({
      value: 0n,
      calldata,
      from: fromAddress,
      to: this.wethAddress,
      publicClient
    })

    const tx = {
      data: calldata,
      gas: toHex(gas),
      from: fromAddress,
      nonce: toHex(nonce),
      to: this.wethAddress,
      maxFeePerGas: toHex(fees.maxFeePerGas),
      maxPriorityFeePerGas: toHex(fees.maxPriorityFeePerGas)
    }

    return tx
  }

  async balanceOf(address: Address) {
    const publicClient = await this.#getPublicClient()
    const abi = await getWeth9ContractAbi()
    const balance = await publicClient.readContract({
      address: this.wethAddress,
      abi,
      functionName: 'balanceOf',
      args: [address]
    })

    return balance as bigint
  }

  async #getPublicClient() {
    if (this.publicClient) {
      return this.publicClient
    }

    const { getViemPublicClient } = await import('@injectivelabs/wallet-base')

    this.publicClient = getViemPublicClient(this.chainId)

    return this.publicClient
  }
}

export const wEth9Contract = new WETH9Contract(INJECTIVE_EVM_CHAIN_ID)
