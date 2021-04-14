import GraphiQL from 'graphiql'
import 'graphiql/graphiql.css'
import React, { useContext } from 'react'
import { H1 } from '../../lib/bulma/Text'
import { GraphQLContext } from '../../lib/graphql/useFetchGraphQL'

const GraphiQLView: React.FC = props => {
  const { fetchGraphQL } = useContext(GraphQLContext)
  const fetchGraphQLGraphiQL = ({ query, variables }: { query: string, variables?: any }) =>
    fetchGraphQL!(query, variables)

  return (
    <div style={{ height: 'calc(100vh - 56px - 52px)' }}>
      <H1 documentTitle="GraphiQL" />
      <GraphiQL fetcher={fetchGraphQLGraphiQL}  />
    </div>
  )
}

export default React.memo(GraphiQLView)
