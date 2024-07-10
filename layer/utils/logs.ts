import { EventLog } from '@injectivelabs/sdk-ts'
import { SharedEventAttribute } from './../types'

export const filterEventLogs = ({
  logs,
  filter
}: {
  logs: EventLog[]
  filter: string
}): EventLog | undefined =>
  logs.find((log) => log.events.find((event) => event.type === filter))

export const filterAttributeValue = ({
  filter,
  attributes
}: {
  filter: string
  attributes: SharedEventAttribute[]
}): SharedEventAttribute | undefined =>
  attributes.find(({ key }) => key === filter)

export const checkAttributeExist = ({
  key,
  value,
  attributes
}: {
  key: string
  value?: string
  attributes: SharedEventAttribute[]
}): boolean =>
  attributes.some(
    (attribute) =>
      (attribute.key === key && !value) || attribute.value === value
  )
