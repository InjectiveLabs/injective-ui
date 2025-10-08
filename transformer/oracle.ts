import { OracleTypeMap } from '@injectivelabs/sdk-ts'
import type { OracleType} from '@injectivelabs/sdk-ts';

export class UiOracleTransformer {
  static grpcOracleTypeToUiOracleType(grpcOracleType: string): OracleType {
    switch (grpcOracleType.toLowerCase()) {
      case 'pricefeed':
        return OracleTypeMap.PriceFeed
      case 'chainlink':
        return OracleTypeMap.Chainlink
      case 'coinbase':
        return OracleTypeMap.Coinbase
      case 'provider':
        return OracleTypeMap.Provider
      case 'bandibc':
        return OracleTypeMap.BandIBC
      case 'razor':
        return OracleTypeMap.Razor
      case 'band':
        return OracleTypeMap.Band
      case 'api3':
        return OracleTypeMap.API3
      case 'pyth':
        return OracleTypeMap.Pyth
      case 'dia':
        return OracleTypeMap.Dia
      case 'uma':
        return OracleTypeMap.Uma
      default:
        return OracleTypeMap.Coinbase
    }
  }
}
