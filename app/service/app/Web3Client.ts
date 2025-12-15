import { toBigNumber } from '@injectivelabs/utils'
import { EvmChainId } from '@injectivelabs/ts-types'
import { peggyDenomToContractAddress } from './utils'
import { Web3Exception } from '@injectivelabs/exceptions'
import { isTestnetOrDevnet } from '@injectivelabs/networks'
import { Erc20Contract } from '../../utils/evm/Erc20Contract'
import {
  injToken,
  injErc20Token,
  injectivePeggyAddress
} from '../../data/token'
import type { Address } from 'viem'
import type { Network } from '@injectivelabs/networks'

/**
 * Preparing and broadcasting
 * Ethereum transactions
 */
export class Web3Client {
  private erc20Contract: Erc20Contract
  private network: Network

  constructor({ rpc, network }: { rpc: string; network: Network }) {
    this.network = network

    // Use Sepolia for testnet/devnet, Mainnet otherwise
    const chainId = isTestnetOrDevnet(network)
      ? EvmChainId.Sepolia
      : EvmChainId.Mainnet

    // Pass the Alchemy RPC URL to the viem helper
    this.erc20Contract = new Erc20Contract(chainId, rpc)
  }

  async fetchTokenBalanceAndAllowance({
    address,
    contractAddress
  }: {
    address: string
    contractAddress: string
  }): Promise<{ balance: string; allowance: string }> {
    const { network } = this

    if (
      !contractAddress.startsWith('peggy') &&
      !contractAddress.startsWith('0x') &&
      contractAddress !== injToken.denom
    ) {
      return {
        balance: toBigNumber(0).toFixed(),
        allowance: toBigNumber(0).toFixed()
      }
    }

    try {
      const tokenAddress = peggyDenomToContractAddress(contractAddress)
      const tokenContractAddress = (
        tokenAddress === injToken.denom ? injErc20Token.address : tokenAddress
      ) as Address

      // Single multicall for both balance and allowance
      const { balance, allowance } =
        await this.erc20Contract.balanceAndAllowance({
          tokenAddress: tokenContractAddress,
          owner: address as Address,
          spender: injectivePeggyAddress[network] as Address
        })

      return {
        balance: toBigNumber(balance.toString()).toFixed(),
        allowance: toBigNumber(allowance.toString()).toFixed()
      }
    } catch {
      return {
        balance: toBigNumber(0).toFixed(),
        allowance: toBigNumber(0).toFixed()
      }
    }
  }

  async fetchEtherBalance(address: string) {
    try {
      const ethBalance = await this.erc20Contract.getBalance(address as Address)

      return ethBalance.toString()
    } catch (e: unknown) {
      throw new Web3Exception(new Error(e as any))
    }
  }

  async fetchTokenMetaData(address: string) {
    try {
      return await this.erc20Contract.getTokenMetadata(address as Address)
    } catch (e: unknown) {
      throw new Web3Exception(new Error(e as any))
    }
  }
}
