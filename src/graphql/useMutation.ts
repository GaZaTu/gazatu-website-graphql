import { useContext, useMemo, useState } from 'react'
import { GraphQLScript } from './graphql'
import { GraphQLContext } from './useFetchGraphQL'

type GraphQLResult<T = any> = {
  errors?: any[]
  data?: T
}

type UseMutationResult<T> = [(variables: { [key: string]: any }) => Promise<T>, [T | undefined, Error | undefined, boolean]]

type UseMutation = <T = any>(args: { query: GraphQLScript }) => UseMutationResult<T>

const useMutation: UseMutation = ({ query }) => {
  const context = useContext(GraphQLContext)
  const { fetchGraphQL } = context
  const queryScript = query?.script

  if (!fetchGraphQL) {
    throw new Error('Invalid `GraphQLContext`')
  }

  const [loading, setLoading] = useState(true)
  const [graphQLResult, setGraphQLResult] = useState<GraphQLResult>()
  const [error, setError] = useState<Error>()

  const execute = useMemo(() => {
    return (variables: { [key: string]: any }) =>
      fetchGraphQL(queryScript, variables)
        .then(graphQLResult => {
          setLoading(false)
          setGraphQLResult(graphQLResult)

          const graphqlErrorMessage = graphQLResult?.errors?.[0]?.message
          const graphqlError = graphqlErrorMessage ? new Error(graphqlErrorMessage) : undefined
          setError(graphqlError)

          if (graphqlError) {
            throw graphqlError
          }

          return graphQLResult.data
        }, error => {
          setLoading(false)
          setError(error)
        })
  }, [fetchGraphQL, queryScript, setError])

  if (error) {
    return [execute, [undefined, error, loading]]
  } else if (graphQLResult) {
    return [execute, [graphQLResult.data, undefined, loading]]
  } else {
    return [execute, [undefined, undefined, loading]]
  }
}

export default useMutation
