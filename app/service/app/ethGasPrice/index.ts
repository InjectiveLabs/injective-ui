import { fetchEstimatorGasPrice } from './estimator'
import { EvmChainId } from '@injectivelabs/ts-types'
import { HttpClient, toBigNumber } from '@injectivelabs/utils'
import { getViemPublicClient } from '@injectivelabs/wallet-base'
import {
  GeneralException,
  HttpRequestException
} from '@injectivelabs/exceptions'
import {
  IS_MAINNET,
  GWEI_IN_WEI,
  DEFAULT_MAINNET_GAS_PRICE
} from '../../../utils/constant'
import { alchemyRpcEndpoint } from './../../../wallet'

export interface GasInfo {
  gasPrice: string
  estimatedTimeMs: number
}

export interface EtherchainResult {
  fast: number
  fastest: number
  safeLow: number
  standard: number
  currentBaseFee: number
  recommendedBaseFee: number
}

export interface EthGasStationResult {
  fast: number
  speed: number
  average: number
  avgWait: number
  fastest: number
  safeLow: number
  fastWait: number
  blockNum: number
  block_time: number
  fastestWait: number
  safeLowWait: number
}

const fetchGasPriceFromEthereum = async (): Promise<string> => {
  try {
    const chainId = IS_MAINNET ? EvmChainId.Mainnet : EvmChainId.Sepolia
    const publicClient = getViemPublicClient(chainId, alchemyRpcEndpoint)
    const response = await publicClient.estimateFeesPerGas()

    if (!response) {
      throw new GeneralException(new Error('No response from Ethereum'))
    }

    if (response.maxFeePerGas) {
      return response.maxFeePerGas.toString()
    }

    const gasPrice = await publicClient.getGasPrice()

    if (!gasPrice) {
      throw new GeneralException(
        new Error('No gas price response from Ethereum')
      )
    }

    return toBigNumber(gasPrice.toString()).toFixed()
  } catch (e: unknown) {
    if (e instanceof HttpRequestException) {
      throw e
    }

    throw new GeneralException(new Error(e as any))
  }
}

export const fetchGasPriceFromEtherchain = async (): Promise<string> => {
  try {
    const endpoint = 'https://www.etherchain.org/api/gasPriceOracle'
    const response = (await new HttpClient(endpoint).get('')) as {
      data: EtherchainResult
    }

    if (!response || (response && !response.data)) {
      throw new GeneralException(new Error('No response from Etherchain'))
    }

    return toBigNumber(response.data.recommendedBaseFee)
      .multipliedBy(GWEI_IN_WEI)
      .toFixed(0)
  } catch (e: unknown) {
    if (e instanceof HttpRequestException) {
      throw e
    }

    throw new GeneralException(new Error(e as any))
  }
}

export const fetchGasPriceFromEthGasStation = async (): Promise<string> => {
  try {
    const endpoint = 'https://ethgasstation.info/json/ethgasAPI.json'
    const response = (await new HttpClient(endpoint).get('')) as {
      data: EthGasStationResult
    }

    if (!response || (response && !response.data)) {
      throw new HttpRequestException(
        new Error('No response from Ethgasstation'),
        {
          context: endpoint
        }
      )
    }

    return toBigNumber(response.data.fastest / 10)
      .times(2.125)
      .multipliedBy(GWEI_IN_WEI)
      .toFixed(0)
  } catch (e: unknown) {
    if (e instanceof HttpRequestException) {
      throw e
    }

    throw new HttpRequestException(new Error(e as any))
  }
}

export const fetchGasPrice = async (): Promise<string> => {
  try {
    const gasPrice = await fetchEstimatorGasPrice()

    if (gasPrice) {
      return gasPrice.fast.toString()
    }
  } catch {
    //
  }

  try {
    const gasPrice = await fetchGasPriceFromEthereum()

    if (gasPrice) {
      return gasPrice.toString()
    }
  } catch {
    //
  }

  return toBigNumber(DEFAULT_MAINNET_GAS_PRICE).toString()
}
