import { Coin, BlockWithTxs, ExplorerTransaction } from '@injectivelabs/sdk-ts'

export interface UiExplorerTransaction extends ExplorerTransaction {
  types: string[]
  coinReceived: Coin[]
  coinSpent: Coin[]
}

export interface UiExplorerBlockWithTxs extends Omit<BlockWithTxs, 'txs'> {
  txs: UiExplorerTransaction[]
}

export type SharedEventAttribute = {
  key: string
  value: string
}
