import React from 'react'

export type FetchGraphQL = (query: string, variables?: { [key: string]: any }) => Promise<any>

export const GraphQLContext = React.createContext({
  fetchGraphQL: null as FetchGraphQL | null,
})
