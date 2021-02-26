import { useState, useMemo, useContext } from 'react'
import { GraphQLScript } from './graphql'
import { GraphQLContext } from './createFetchGraphQL'

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

  const execute = useMemo(() => {
    return (variables: { [key: string]: any }) =>
      fetchGraphQL(queryScript, variables)
        .then(graphQLResult => {
          setLoading(false)
          setGraphQLResult(graphQLResult)

          if (graphQLResult.errors?.length > 0) {
            throw new Error(graphQLResult.errors[0].message)
          } else {
            return graphQLResult.data
          }
        })
  }, [fetchGraphQL, queryScript])

  if (graphQLResult) {
    if ((graphQLResult.errors?.length ?? 0) > 0) {
      return [execute, [undefined, new Error(graphQLResult.errors?.[0].message), loading]]
    } else {
      return [execute, [graphQLResult.data, undefined, loading]]
    }
  } else {
    return [execute, [undefined, undefined, loading]]
  }
}

export default useMutation
