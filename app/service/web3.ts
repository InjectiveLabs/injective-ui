import { NETWORK } from '../utils/constant'
import { Web3Client } from './app/Web3Client'
import { Web3GatewayService } from './app/Web3Gateway'
import { alchemyRpcEndpoint } from '../wallet/utils/alchemy'

export const web3Client = new Web3Client({
  network: NETWORK,
  rpc: alchemyRpcEndpoint
})

export const web3GatewayService = new Web3GatewayService()
