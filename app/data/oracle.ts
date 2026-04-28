import { usdcToken } from './token'
import { IS_MAINNET } from '../utils/constant'

export const ORACLE_TYPE_CHAINLINK_DATASTREAMS = 'chainlinkdatastreams'

export const ORACLE_USD_PRICE_TOKENS: Record<string, string> = {
  [usdcToken.denom]: IS_MAINNET
    ? '0x00038f83323b6b08116d1614cf33a9bd71ab5e0abf0c9f1b783a74a43e7bd992'
    : '0x0003dc85e8b01946bf9dfd8b0db860129181eb6105a8c8981d9f28e00b6f60d9'
}
