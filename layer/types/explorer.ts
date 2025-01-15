import {
  type Coin,
  type Message,
  type BlockWithTxs,
  type ContractTransaction,
  type ExplorerTransaction
} from '@injectivelabs/sdk-ts'

export interface MessageWithSummary extends Message {
  msgSummary: string[]
}

export interface UiExplorerTransaction extends ExplorerTransaction {
  types: string[]
  coinReceived: Coin[]
  coinSpent: Coin[]
  templateMsgs: string[]
  msgsWithSummary: MessageWithSummary[]
}

export interface UiContractTransaction extends ContractTransaction {
  hash: string
  blockNumber: number
  blockTimestamp: number
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
