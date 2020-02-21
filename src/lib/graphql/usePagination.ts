import { useState } from 'react'

type PaginationParams = {
  after?: string
  before?: string
}

type PaginationVariables = PaginationParams & {
  first?: number
  last?: number
}

type UsePaginationResult = [PaginationVariables, (params: PaginationParams) => void, number]

type UsePagination = (pageSize: number) => UsePaginationResult

const usePagination: UsePagination = (pageSize: number) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [variables, setVariables] = useState<PaginationVariables>({
    after: undefined,
    before: undefined,
    first: pageSize,
    last: undefined,
  })

  const paginate = (params: PaginationParams) => {
    if (params.after) {
      setCurrentPage(state => state + 1)
      setVariables({
        after: params.after,
        before: undefined,
        first: pageSize,
        last: undefined,
      })
    } else if (params.before) {
      setCurrentPage(state => state - 1)
      setVariables({
        after: undefined,
        before: params.before,
        first: undefined,
        last: pageSize,
      })
    }
  }

  return [variables, paginate, currentPage]
}

export default usePagination
