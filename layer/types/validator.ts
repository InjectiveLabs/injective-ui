import {
  BondStatus,
  ValidatorCommission,
  ValidatorDescription
} from '@injectivelabs/sdk-ts'

export interface SharedUiValidator {
  jailed: boolean
  status: BondStatus
  unbondingTime: number
  unbondingHeight: number
  commissionRate: string
  minSelfDelegation: string
  delegatorShares: string
  tokens: string
  operatorAddress: string
  consensusPubKey?: string
  description: ValidatorDescription
  commission: ValidatorCommission
  name: string
  address: string
}
