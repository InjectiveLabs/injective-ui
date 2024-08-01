import { Coin, ExplorerTransaction } from '@injectivelabs/sdk-ts'

export interface UiExplorerTransaction extends ExplorerTransaction {
  types: string[]
  coinReceived: Coin[]
  coinSpent: Coin[]
}

export type SharedEventAttribute = {
  key: string
  value: string
}
