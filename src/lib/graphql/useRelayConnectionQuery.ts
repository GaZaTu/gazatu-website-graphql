import { useLayoutEffect, useState } from 'react'
import { GraphQLScript } from './graphql'
import useQuery from './useQuery'
import useRelayConnection from './useRelayConnection'

type UseRelayConnectionQueryResult<T> = [[T[] | undefined, Error | undefined, boolean, () => void], [number, number, ((pages?: number) => void) | undefined, ((pages?: number) => void) | undefined, ((newPage: number) => void)]]

type UseRelayConnectionQuery = <T>(args: { query: GraphQLScript, variables?: Record<string, any>, pageSize: number }) => UseRelayConnectionQueryResult<T>

const useRelayConnectionQuery: UseRelayConnectionQuery = ({ query, variables, pageSize }) => {
  const [resultSet, setResultSet] = useState()
  const [[parsedEdges, combinedVariables], [count, page, paginateForward, paginateBackward, setPage]] = useRelayConnection<any>({
    resultSet,
    variables,
    pageSize,
  })
  const [data, error, loading, retry] = useQuery({
    query,
    variables: combinedVariables,
  })

  useLayoutEffect(() => {
    setResultSet(data ? Object.values<any>(data as any)[0] : undefined)
  }, [data])

  return [[parsedEdges, error, loading, retry], [count, page, paginateForward, paginateBackward, setPage]]
}

export default useRelayConnectionQuery
