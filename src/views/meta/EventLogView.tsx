import React from 'react'
import { graphql } from '../../lib/graphql/graphql'
import useDocumentAndDrawerTitle from '../../lib/useDocumentAndDrawerTitle'
import useDrawerWithoutPadding from '../../lib/useDrawerWithoutPadding'
import AppTable from '../../app/AppTable'
import { MUIDataTableOptions } from 'mui-datatables'
import useQuery from '../../lib/graphql/useQuery'
import { Query } from '../../lib/graphql/schema.gql'
import NavLink from '../../lib/mui/NavLink'
import { IconButton } from '@material-ui/core'
import OpenInBrowser from '@material-ui/icons/OpenInBrowser'

const EventLogView: React.FC = () => {
  useDocumentAndDrawerTitle('Event-Log')
  useDrawerWithoutPadding()

  const query = graphql`
    query Query {
      changes {
        kind
        targetEntityName
        targetId
        targetColumn
        newColumnValue
        createdAt
      }
    }
  `

  const [data, error, loading, retry] = useQuery<Query>({
    query,
  })

  const tableOptions = React.useMemo<MUIDataTableOptions>(() => {
    return {
      serverSide: false,
      count: data?.changes?.length,
      filter: false,
      rowsPerPageOptions: [20],
    }
  }, [data])

  if (data) {
    return (
      <div>
        <AppTable title="" data={data.changes ?? []} options={tableOptions}>
          <AppTable.Column name="" options={{ empty: true, filter: false, sort: false }}>
            {(_, meta) => {
              const kind = meta.rowData?.[1]
              const targetEntityName = meta.rowData?.[2]
              const targetId = meta.rowData?.[3]

              const href = (() => {
                switch (targetEntityName) {
                  case 'TriviaQuestion':
                    return `/trivia/questions/${targetId}`
                  default:
                    return undefined
                }
              })()

              return href && kind !== 'REMOVE' && (
                <NavLink href={href}>
                  <IconButton size="small">
                    <OpenInBrowser />
                  </IconButton>
                </NavLink>
              )
            }}
          </AppTable.Column>
          <AppTable.Column name="kind" label="Kind" />
          <AppTable.Column name="targetEntityName" label="Entity" />
          <AppTable.Column name="targetId" label="ID" />
          <AppTable.Column name="targetColumn" label="Column" />
          <AppTable.Column name="newColumnValue" label="Value" />
          <AppTable.Column name="createdAt" label="Date">
            {v => new Date(v).toLocaleDateString()}
          </AppTable.Column>
        </AppTable>
      </div>
    )
  } else if (error) {
    return (
      <div>
        <pre>{error.message}</pre>
        <button onClick={retry} disabled={loading}>Retry</button>
      </div>
    )
  } else {
    return (
      <div>Loading...</div>
    )
  }
}

export default EventLogView
