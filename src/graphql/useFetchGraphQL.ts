import React, { useMemo } from 'react'

export type FetchGraphQL = (query: string, variables?: { [key: string]: any }) => Promise<any>

export const GraphQLContext = React.createContext({
  fetchGraphQL: null as FetchGraphQL | null,
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
