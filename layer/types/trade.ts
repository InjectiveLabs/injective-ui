import { SpotTrade, DerivativeTrade } from '@injectivelabs/sdk-ts'

export interface SharedUiSpotTrade extends SpotTrade {
  ticker?: string
}

export interface SharedUiDerivativeTrade extends DerivativeTrade {
  ticker?: string
}
