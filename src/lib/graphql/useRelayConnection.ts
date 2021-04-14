import { useMemo } from 'react'
import { GraphQLFragment, GraphQLScript } from './graphql'
import useRelayPagination from './useRelayPagination'

type UseRelayConnectionResult<T> = [[T[] | undefined, Record<string, any>], [number, number, ((skipPages?: number) => void) | undefined, ((skipPages?: number) => void) | undefined, ((newPage: number) => void)]]

type UseRelayConnection = <T>(args: { resultSet?: any, variables?: Record<string, any>, pageSize: number }) => UseRelayConnectionResult<T>

const useRelayConnection: UseRelayConnection = ({ resultSet, variables, pageSize }) => {
  const [pagination, setPagination, page] = useRelayPagination(pageSize)
  const combinedVariables = useMemo(() => {
    return {
      ...variables,
      ...pagination,
    }
  }, [variables, pagination])

  const parsedData = useMemo(() => {
    if (resultSet) {
      return {
        edges: resultSet.edges as { node: any, cursor: string }[],
        nodes: resultSet.edges.map((edge: any) => edge.node),
        pageInfo: resultSet.pageInfo as { startCursor?: string, endCursor?: string, hasPreviousPage: boolean, hasNextPage: boolean, count: number },
      }
    } else {
      return undefined
    }
  }, [resultSet])

  const paginateForwards = useMemo(() => {
    if (parsedData?.pageInfo.hasNextPage) {
      return (skipPages?: number) => {
        setPagination({
          after: parsedData!.pageInfo.endCursor,
          skipPages,
        })
      }
    } else {
      return undefined
    }
  }, [parsedData, setPagination])

  const paginateBackwards = useMemo(() => {
    if (parsedData?.pageInfo.hasPreviousPage) {
      return (skipPages?: number) =>
        setPagination({
          before: parsedData!.pageInfo.startCursor,
          skipPages,
        })
    } else {
      return undefined
    }
  }, [parsedData, setPagination])

  const paginate = useMemo(() => {
    return (newPage: number) => {
      const pages = newPage - page

      if (newPage === 0) {
        setPagination({})
      } else if (pages > 0) {
        paginateForwards?.(pages - 1)
      } else if (pages < 0) {
        paginateBackwards?.(Math.abs(pages) - 1)
      }
    }
  }, [page, paginateBackwards, paginateForwards, setPagination])

  if (parsedData) {
    return [[parsedData.nodes, combinedVariables], [parsedData.pageInfo.count, page, paginateForwards, paginateBackwards, paginate]]
  } else {
    return [[undefined, combinedVariables], [0, page, undefined, undefined, () => {}]]
  }
}

export default useRelayConnection

export const relayConnectionFragment = (nodeFragment: GraphQLScript) =>
  `
    edges {
      node {
        ...${(nodeFragment as GraphQLFragment).spread}
      }
      cursor
    }
    pageInfo {
      startCursor
      endCursor
      hasPreviousPage
      hasNextPage
      count
    }
  `
