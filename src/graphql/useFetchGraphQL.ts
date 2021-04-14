import React, { useMemo, useState } from 'react'

export type FetchGraphQL = (query: string, variables?: { [key: string]: any }) => Promise<any>

const _GraphQLContext = React.createContext({
  fetchGraphQL: null as FetchGraphQL | null,

  queryCount: 0,
  setQueryCount: (count: (v: number) => number) => { },

  mutationCount: 0,
  setMutationCount: (count: (v: number) => number) => { },
})
const _GraphQLContextProvider = _GraphQLContext.Provider

const GraphQLContextProvider: React.FC<{ value: { fetchGraphQL: FetchGraphQL } }> = props => {
  const { value: { fetchGraphQL }, children } = props

  const [queryCount, setQueryCount] = useState(0)
  const [mutationCount, setMutationCount] = useState(0)

  const value = {
    fetchGraphQL,

    queryCount,
    setQueryCount,

    mutationCount,
    setMutationCount,
  } as any

  return React.createElement(_GraphQLContextProvider, { value }, children)
}

export const GraphQLContext = Object.assign(_GraphQLContext, {
  Provider: GraphQLContextProvider,
})

export const createFetchGraphQL = (init?: RequestInit) =>
  (query: string, variables?: { [key: string]: any }) =>
    fetch(process.env.REACT_APP_GRAPHQL_URL!, {
      ...init,
      mode: 'cors',
      method: 'POST',
      headers: {
        ...init?.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    }).then(response => response.json())

const useFetchGraphQL = (init?: RequestInit) =>
  useMemo(() => createFetchGraphQL(init), [init])

export default useFetchGraphQL
