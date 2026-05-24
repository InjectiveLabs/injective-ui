import {
  rfqContractAddress,
  mitoSwapContractAddress,
  helixSwapContractAddress
} from './../../data/wasmContracts'
import type { EventLog } from '@injectivelabs/sdk-ts'
import type { ContractMsgLabel } from './../../types/explorer'

type SummaryFn = (args: {
  sender: string
  funds?: string
  logs: EventLog[]
  msg: Record<string, any>
}) => string | undefined

export type ContractSummaryConfig = {
  copy: string
  summaryFn: SummaryFn
  msgLabel?: ContractMsgLabel
}

const MSG_ACTION = {
  ACCEPT_QUOTE: 'accept_quote',
  SWAP_MIN_OUTPUT: 'swap_min_output'
} as const

/**
 * RFQ summary is derived directly from the message body — the accept_quote
 * payload contains all required fields (direction, market_id, quantity).
 */
const generateRfqSummary = ({
  msg,
  sender
}: {
  sender: string
  msg: Record<string, any>
}) => {
  try {
    const acceptQuote = msg[MSG_ACTION.ACCEPT_QUOTE] as
      | undefined
      | { quantity: string; direction: string; market_id: string }

    if (
      !acceptQuote?.direction ||
      !acceptQuote?.market_id ||
      !acceptQuote?.quantity
    ) {
      return undefined
    }

    const { direction, market_id: marketId, quantity } = acceptQuote
    const normalizedDirection = direction?.toUpperCase()
    const side =
      normalizedDirection === 'LONG' || normalizedDirection === 'SHORT'
        ? normalizedDirection
        : undefined

    if (!side) {
      return undefined
    }

    return `{{account:${sender}}} created a MARKET ${side} order for {{derivativeQuantity:${marketId}-${quantity}}} {{market:${marketId}}}`
  } catch {
    return undefined
  }
}

/**
 * Swap summary is derived from the wasm-atomic_swap_execution event, which
 * carries the actual input/output amounts settled on-chain.
 */
const generateSwapSummary = ({
  sender,
  logs
}: {
  sender: string
  logs: EventLog[]
}) => {
  try {
    const swapEvent = logs
      .flatMap(({ events }) => events)
      .find(({ type }) => type === 'wasm-atomic_swap_execution')

    if (!swapEvent) {
      return undefined
    }

    const attr = (key: string) =>
      swapEvent.attributes.find((a) => a.key === key)?.value

    const swapInputAmount = attr('swap_input_amount')
    const swapInputDenom = attr('swap_input_denom')
    const swapFinalAmount = attr('swap_final_amount')
    const swapFinalDenom = attr('swap_final_denom')

    if (!swapInputAmount || !swapInputDenom || !swapFinalAmount || !swapFinalDenom) {
      return undefined
    }

    return `{{account:${sender}}} Swapped {{denom:${swapInputDenom}-${swapInputAmount}}} for {{denom:${swapFinalDenom}-${swapFinalAmount}}}`
  } catch {
    return undefined
  }
}

const swapConfig = (copy: string): ContractSummaryConfig => ({
  copy,
  summaryFn: generateSwapSummary,
  msgLabel: { label: 'Swap', msgAction: MSG_ACTION.SWAP_MIN_OUTPUT }
})

export const contractRegistry: Record<string, ContractSummaryConfig> = {
  [helixSwapContractAddress]: swapConfig('Helix Swap'),
  [rfqContractAddress]: {
    copy: 'RFQ',
    summaryFn: generateRfqSummary,
    msgLabel: { label: 'Create RFQ Trade', msgAction: MSG_ACTION.ACCEPT_QUOTE }
  },
  // mitoSwapContractAddress is undefined on devnet — no devnet deployment exists
  ...(mitoSwapContractAddress && {
    [mitoSwapContractAddress]: swapConfig('Mito Swap')
  })
}

export const contractSummaryMap = Object.fromEntries(
  Object.entries(contractRegistry).map(([addr, { summaryFn }]) => [
    addr,
    summaryFn
  ])
)

/** Both contract address AND msgAction must match before the label is applied. */
export const contractMsgLabelMap: Record<string, ContractMsgLabel> =
  Object.fromEntries(
    Object.entries(contractRegistry)
      .filter(([, { msgLabel }]) => msgLabel !== undefined)
      .map(([addr, { msgLabel }]) => [addr, msgLabel!])
  )

export const hardCodedContractCopyMap: Record<string, string> =
  Object.fromEntries(
    Object.entries(contractRegistry).map(([addr, { copy }]) => [addr, copy])
  )
