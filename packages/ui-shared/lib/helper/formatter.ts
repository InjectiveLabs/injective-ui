import { BigNumber, BigNumberInWei } from '@injectivelabs/utils'

export const baseToBalanceInToken = ({
  value,
  decimalPlaces,
  fixedDecimals,
  roundingMode
}: {
  value: string | number
  decimalPlaces: number
  fixedDecimals?: number
  roundingMode?: BigNumber.RoundingMode
}): string => {
  const balanceInToken = new BigNumberInWei(value).toBase(decimalPlaces)

  if (fixedDecimals) {
    return balanceInToken.toFixed(fixedDecimals, roundingMode)
  }

  return balanceInToken.toFixed()
}
