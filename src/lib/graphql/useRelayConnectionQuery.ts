import { useState, useLayoutEffect } from 'react'
import useQuery from './useQuery'
import { GraphQLScript } from './graphql'
import useRelayConnection from './useRelayConnection'

type UseRelayConnectionQueryResult<T> = [[T[] | undefined, Error | undefined, boolean, () => void], [number, number, (() => void) | undefined, (() => void) | undefined]]

type UseRelayConnectionQuery = <T>(args: { query: GraphQLScript, variables?: { [key: string]: any }, pageSize: number }) => UseRelayConnectionQueryResult<T>

const useRelayConnectionQuery: UseRelayConnectionQuery = ({ query, variables, pageSize }) => {
  const [resultSet, setResultSet] = useState()
  const [[parsedEdges, combinedVariables], [count, page, paginateForward, paginateBackward]] = useRelayConnection<any>({
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

  return [[parsedEdges, error, loading, retry], [count, page, paginateForward, paginateBackward]]
}

export default useRelayConnectionQuery
