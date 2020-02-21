import { useEffect, useContext, useState, useRef } from 'react'
import { GraphQLScript } from './graphql'
import { GraphQLContext } from './context'

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

  const runningRequests = useRef([] as Promise<any>[])

  useEffect(() => {
    if (queryScript) {
      runningRequests.current = [] // cancel previous requests

      const thisRequest = fetchGraphQL(queryScript, variables)
        .then(graphQLResult => {
          if (runningRequests.current.includes(thisRequest)) {
            setLoading(false)
            setGraphQLResult(graphQLResult)
          }
        })

      runningRequests.current.push(thisRequest)
    }

    return () => {
      setLoading(true)
    }
  }, [fetchGraphQL, queryScript, variables, trueOrFalse])

  const forceUpdate = () => setTrueOrFalse(s => !s)

  if (graphQLResult) {
    if ((graphQLResult.errors?.length ?? 0) > 0) {
      return [undefined, new Error(graphQLResult.errors?.[0].message), loading, forceUpdate]
    } else {
      return [graphQLResult.data, undefined, loading, forceUpdate]
    }
  } else {
    return [undefined, undefined, loading, forceUpdate]
  }
}

export default useQuery
