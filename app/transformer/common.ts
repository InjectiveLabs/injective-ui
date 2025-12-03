import { paginationUint8ArrayToString } from '@injectivelabs/sdk-ts/utils'
import type { Pagination, PagePagination } from '@injectivelabs/sdk-ts'

export const pageResponseToPagination = ({
  newPagination,
  oldPagination
}: {
  newPagination?: undefined | Pagination
  oldPagination: undefined | PagePagination
}): PagePagination => {
  if (!newPagination) {
    return {
      prev: null,
      current: null,
      next: null
    }
  }

  const next = paginationUint8ArrayToString(newPagination.next)

  if (!oldPagination) {
    return {
      prev: null,
      current: null,
      next
    }
  }

  return {
    prev: oldPagination.current,
    current: oldPagination.next,
    next
  }
}
