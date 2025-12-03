import { intervalToDuration } from 'date-fns'
import { toBigNumber } from '@injectivelabs/utils'

export const todayInSeconds = (): number => {
  return Math.floor(Date.now() / 1000)
}

export const sharedGetDuration = ({
  endDateInMilliseconds,
  nowInMilliseconds
}: {
  nowInMilliseconds: string
  endDateInMilliseconds: string
}) => {
  const endInBigNumber = toBigNumber(endDateInMilliseconds)
  const nowInBigNumber = toBigNumber(nowInMilliseconds)

  const startInMilliseconds = nowInBigNumber.isGreaterThan(endInBigNumber)
    ? endInBigNumber
    : nowInBigNumber

  const duration = intervalToDuration({
    start: startInMilliseconds.toNumber(),
    end: endInBigNumber.toNumber()
  })

  return duration
}
