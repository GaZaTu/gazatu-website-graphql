import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { GraphQLScript } from './graphql'
import useDeepCompare from './useDeepCompare'
import { GraphQLContext } from './useFetchGraphQL'

type GraphQLResult<T = any> = {
  errors?: any[]
  data?: T
}

type UseQueryResult<T> = [T | undefined, Error | undefined, boolean, () => void, () => void]

type UseQuery = <T>(args: { query?: GraphQLScript, variables?: Record<string, any>, disabled?: boolean }) => UseQueryResult<T>

const useQuery: UseQuery = ({ query, variables, disabled }) => {
  const { fetchGraphQL } = useContext(GraphQLContext)
  if (!fetchGraphQL) {
    throw new Error('Invalid `GraphQLContext`')
  }

  const [loading, setLoading] = useState(true)
  const [trueOrFalse, setTrueOrFalse] = useState(false)
  const [graphQLResult, setGraphQLResult] = useState<GraphQLResult>()
  const [error, setError] = useState<Error>()

  const cachedVariables = useDeepCompare(variables)
  const runningRequests = useRef([] as Promise<any>[])
  useEffect(() => {
    if (query?.script && !disabled) {
      setLoading(true)
      runningRequests.current = [] // cancel previous requests

      const thisRequest = fetchGraphQL(query?.script, cachedVariables)
        .then(graphQLResult => {
          if (runningRequests.current.includes(thisRequest)) {
            setLoading(false)
            setGraphQLResult(graphQLResult)

            const graphqlErrorMessage = graphQLResult?.errors?.[0]?.message
            const graphqlError = graphqlErrorMessage ? new Error(graphqlErrorMessage) : undefined
            setError(graphqlError)
          }
        }, error => {
          setLoading(false)
          setGraphQLResult(undefined)
          setError(error)
        })

      runningRequests.current.push(thisRequest)
    } else {
      setLoading(false)
      setGraphQLResult(undefined)
      setError(undefined)
    }
  }, [fetchGraphQL, query?.script, disabled, cachedVariables, trueOrFalse, setError])

  const forceUpdate = useMemo(() => {
    return () => {
      setTrueOrFalse(s => !s)
    }
  }, [setTrueOrFalse])

  const clearResult = useMemo(() => {
    return () => {
      setLoading(false)
      setGraphQLResult(undefined)
      setError(undefined)
    }
  }, [])

  if (error) {
    return [undefined, error, loading, forceUpdate, clearResult]
  } else if (graphQLResult) {
    return [graphQLResult.data, undefined, loading, forceUpdate, clearResult]
  } else {
    return [undefined, undefined, loading, forceUpdate, clearResult]
  }
}

export default useQuery
