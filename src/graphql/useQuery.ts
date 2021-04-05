import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { GraphQLScript } from './graphql'
import { GraphQLContext } from './useFetchGraphQL'

type GraphQLResult<T = any> = {
  errors?: any[]
  data?: T
}

type UseQueryResult<T> = [T | undefined, Error | undefined, boolean, () => void]

type UseQuery = <T>(args: { query?: GraphQLScript, variables?: { [key: string]: any } }) => UseQueryResult<T>

const useQuery: UseQuery = ({ query, variables }) => {
  const context = useContext(GraphQLContext)
  const { fetchGraphQL } = context
  const queryScript = query?.script

  if (!fetchGraphQL) {
    throw new Error('Invalid `GraphQLContext`')
  }

  const [loading, setLoading] = useState(true)
  const [trueOrFalse, setTrueOrFalse] = useState(false)
  const [graphQLResult, setGraphQLResult] = useState<GraphQLResult>()
  const [error, setError] = useState<Error>()

  const runningRequests = useRef([] as Promise<any>[])
  useEffect(() => {
    if (queryScript) {
      runningRequests.current = [] // cancel previous requests

      const thisRequest = fetchGraphQL(queryScript, variables)
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
          setError(error)
        })

      runningRequests.current.push(thisRequest)
    }

    return () => {
      setLoading(true)
    }
  }, [fetchGraphQL, queryScript, variables, trueOrFalse, setError])

  const forceUpdate = useMemo(() => {
    return () => {
      setTrueOrFalse(s => !s)
    }
  }, [setTrueOrFalse])

  if (error) {
    return [undefined, error, loading, forceUpdate]
  } else if (graphQLResult) {
    return [graphQLResult.data, undefined, loading, forceUpdate]
  } else {
    return [undefined, undefined, loading, forceUpdate]
  }
}

export default useQuery
