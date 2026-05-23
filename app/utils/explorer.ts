import { IS_MAINNET, IS_TESTNET } from '../utils/constant'
import {
  ContractMsgType,
  DevnetWasmContractAddress,
  MainnetWasmContractAddress,
  TestnetWasmContractAddress
} from '../types/enum'

export const MainnetContractCopyMap = {
  [MainnetWasmContractAddress.HelixSwap]: 'Helix Swap',
  [MainnetWasmContractAddress.MitoSwap]: 'Mito Swap'
}

export const TestnetContractCopyMap = {
  [TestnetWasmContractAddress.HelixSwap]: 'Helix Swap'
}

export const DevnetContractCopyMap = {
  [DevnetWasmContractAddress.HelixSwap]: 'Mito Swap'
}

export type ContractMsgLabel = {
  /** Human-readable label shown in the explorer */
  label: string
  /** The action key present on the `msg` object (CosmWasm action identifier) */
  msgAction: string
}

const rfqContractAddress = IS_MAINNET
  ? MainnetWasmContractAddress.Rfq
  : IS_TESTNET
    ? TestnetWasmContractAddress.Rfq
    : DevnetWasmContractAddress.Rfq

/** Both the contract address (key) and `msgAction` must match before the label is applied. */
export const contractMsgLabelMap: Record<string, ContractMsgLabel> = {
  [rfqContractAddress]: { label: 'Create RFQ Trade', msgAction: 'accept_quote' }
}

const getHardCodedContracts = () => {
  if (IS_MAINNET) {
    return Object.values(MainnetWasmContractAddress) as string[]
  }

  if (IS_TESTNET) {
    return Object.values(TestnetWasmContractAddress) as string[]
  }

  return Object.values(DevnetWasmContractAddress) as string[]
}

const getHardCodedContractCopyMap = (): Record<string, string> => {
  if (IS_MAINNET) {
    return MainnetContractCopyMap
  }

  if (IS_TESTNET) {
    return TestnetContractCopyMap
  }

  return DevnetContractCopyMap
}

const getContractEventMap = (): Record<string, ContractMsgType> => {
  if (IS_MAINNET) {
    return {
      [MainnetWasmContractAddress.HelixSwap]: ContractMsgType.Swap,
      [MainnetWasmContractAddress.MitoSwap]: ContractMsgType.Swap,
      [MainnetWasmContractAddress.Rfq]: ContractMsgType.RfqTrade
    }
  }

  if (IS_TESTNET) {
    return {
      [TestnetWasmContractAddress.HelixSwap]: ContractMsgType.Swap,
      [TestnetWasmContractAddress.Rfq]: ContractMsgType.RfqTrade
    }
  }

  return {
    [DevnetWasmContractAddress.HelixSwap]: ContractMsgType.Swap,
    [DevnetWasmContractAddress.Rfq]: ContractMsgType.RfqTrade
  }
}

export const contractMsgTypeMap = getContractEventMap()
export const hardCodedContracts = getHardCodedContracts()
export const hardCodedContractCopyMap = getHardCodedContractCopyMap()
