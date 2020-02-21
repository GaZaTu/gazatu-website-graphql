import { useMemo } from 'react'
import usePagination from './usePagination'
import { GraphQLScript, GraphQLFragment } from './graphql'

type UseRelayConnectionResult<T> = [[T[] | undefined, { [key: string]: any }], [number, number, (() => void) | undefined, (() => void) | undefined]]

type UseRelayConnection = <T>(args: { resultSet?: any, variables?: { [key: string]: any }, pageSize: number }) => UseRelayConnectionResult<T>

const useRelayConnection: UseRelayConnection = ({ resultSet, variables, pageSize }) => {
  const [pagination, setPagination, page] = usePagination(pageSize)
  const combinedVariables = useMemo(() => {
    return {
      ...pagination,
      ...variables,
    }
  }, [pagination, variables])

  const parsedData = useMemo(() => {
    if (resultSet) {
      return {
        edges: resultSet.edges as { node: any, cursor: string }[],
        pageInfo: resultSet.pageInfo as { startCursor?: string, endCursor?: string, hasPreviousPage: boolean, hasNextPage: boolean, count: number },
      }
    } else {
      return undefined
    }
  }, [resultSet])

  const paginateForward = useMemo(() => {
    if (parsedData?.pageInfo.hasNextPage) {
      return () =>
        setPagination({
          after: parsedData!.edges[parsedData!.edges.length - 1].cursor,
        })
    } else {
      return undefined
    }
  }, [parsedData, setPagination])

  const paginateBackward = useMemo(() => {
    if (parsedData?.pageInfo.hasPreviousPage) {
      return () =>
        setPagination({
          before: parsedData!.edges[0].cursor,
        })
    } else {
      return undefined
    }
  }, [parsedData, setPagination])

  if (parsedData) {
    return [[parsedData.edges.map(edge => edge.node), combinedVariables], [parsedData.pageInfo.count, page, paginateForward, paginateBackward]]
  } else {
    return [[undefined, combinedVariables], [0, page, undefined, undefined]]
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
