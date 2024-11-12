import { Network, isTestnetOrDevnet } from '@injectivelabs/networks'
import { BigNumberInWei } from '@injectivelabs/utils'
import { Web3Exception } from '@injectivelabs/exceptions'
import { Alchemy, Network as AlchemyNetwork } from 'alchemy-sdk'
import { injToken, injErc20Token, injectivePeggyAddress } from '../data/token'
import { getKeyFromRpcUrl, peggyDenomToContractAddress } from './utils'

/**
 * Preparing and broadcasting
 * Ethereum transactions
 */
export class Web3Client {
  private network: Network

  private rpc: string

  private alchemy: Alchemy | undefined

  constructor({ rpc, network }: { rpc: string; network: Network }) {
    this.rpc = rpc
    this.network = network
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
        balance: new BigNumberInWei(0).toFixed(),
        allowance: new BigNumberInWei(0).toFixed()
      }
    }

    try {
      const alchemy = this.getAlchemy()
      const ethersProvider = await alchemy.config.getProvider()
      const tokenAddress = peggyDenomToContractAddress(contractAddress)
      const tokenContractAddress =
        tokenAddress === injToken.denom ? injErc20Token.address : tokenAddress

      const tokenBalances = await alchemy.core.getTokenBalances(address, [
        tokenContractAddress
      ])

      const tokenBalance = tokenBalances.tokenBalances
        .filter((tokenBalance: any) => tokenBalance.tokenBalance)
        .find(
          (tokenBalance: { contractAddress: string }) =>
            tokenBalance.contractAddress === tokenContractAddress
        )

      const balance = tokenBalance ? tokenBalance.tokenBalance || 0 : 0
      const allowance = await ethersProvider.send('alchemy_getTokenAllowance', [
        {
          owner: address,
          spender: injectivePeggyAddress[network],
          contract: tokenContractAddress
        }
      ])

      return {
        balance: new BigNumberInWei(balance || 0).toFixed(),
        allowance: new BigNumberInWei(allowance || 0).toFixed()
      }
    } catch (e) {
      return {
        balance: new BigNumberInWei(0).toFixed(),
        allowance: new BigNumberInWei(0).toFixed()
      }
    }
  }

  async fetchTokenMetaData(address: string) {
    const alchemy = await this.getAlchemy()

    try {
      return await alchemy.core.getTokenMetadata(address)
    } catch (e: unknown) {
      throw new Web3Exception(new Error(e as any))
    }
  }

  async fetchEtherBalance(address: string) {
    const alchemy = await this.getAlchemy()

    try {
      const ethBalance = await alchemy.core.getBalance(address, 'latest')

      return ethBalance.toString()
    } catch (e: unknown) {
      throw new Web3Exception(new Error(e as any))
    }
  }

  private getAlchemy() {
    if (this.alchemy) {
      return this.alchemy
    }

    const { rpc, network } = this

    this.alchemy = new Alchemy({
      apiKey: getKeyFromRpcUrl(rpc),
      network: !isTestnetOrDevnet(network)
        ? AlchemyNetwork.ETH_MAINNET
        : AlchemyNetwork.ETH_SEPOLIA
    })

    return this.alchemy
  }
}
