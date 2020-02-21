import React, { useContext } from 'react'
import GraphiQL from 'graphiql'
import 'graphiql/graphiql.css'
import { GraphQLContext } from '../../lib/graphql'
import useDocumentAndDrawerTitle from '../../lib/useDocumentAndDrawerTitle'
import useDrawerWithoutPadding from '../../lib/useDrawerWithoutPadding'

const GraphiQLView: React.FC = () => {
  useDocumentAndDrawerTitle('GraphiQL')
  useDrawerWithoutPadding()

  const { fetchGraphQL } = useContext(GraphQLContext)
  const fetchGraphQLGraphiQL = ({ query, variables }: { query: string, variables: any }) =>
    fetchGraphQL!(query, variables)

  return (
    <div style={{ height: 'calc(100vh - 64px)' }}>
      <GraphiQL fetcher={fetchGraphQLGraphiQL} />
    </div>
  )
}

export default GraphiQLView
