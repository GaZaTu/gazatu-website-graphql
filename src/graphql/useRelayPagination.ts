import { useMemo, useState } from 'react'

type RelayPaginationParams = {
  after?: string
  before?: string
  skipPages?: number
}

type RelayPaginationVariables = RelayPaginationParams & {
  first?: number
  last?: number
}

type UseRelayPaginationResult = [RelayPaginationVariables, (params: RelayPaginationParams) => void, number]

type UseRelayPagination = (pageSize: number) => UseRelayPaginationResult

const useRelayPagination: UseRelayPagination = (pageSize: number) => {
  const [currentPage, setCurrentPage] = useState(0)
  const [variables, setVariables] = useState<RelayPaginationVariables>({
    after: undefined,
    before: undefined,
    first: pageSize,
    last: undefined,
    skipPages: undefined,
  })

  const paginate = useMemo(() => {
    return ({ after, before, skipPages }: RelayPaginationParams) => {
      if (after) {
        setCurrentPage(state => state + 1 + (skipPages ?? 0))
        setVariables({
          after,
          before: undefined,
          first: pageSize,
          last: undefined,
          skipPages,
        })
      } else if (before) {
        setCurrentPage(state => state - 1 - (skipPages ?? 0))
        setVariables({
          after: undefined,
          before,
          first: undefined,
          last: pageSize,
          skipPages,
        })
      } else {
        setCurrentPage(0)
        setVariables({
          after: undefined,
          before: undefined,
          first: pageSize,
          last: undefined,
          skipPages: undefined,
        })
      }
    }
  }, [setCurrentPage, setVariables, pageSize])

  return [variables, paginate, currentPage]
}

export default useRelayPagination
