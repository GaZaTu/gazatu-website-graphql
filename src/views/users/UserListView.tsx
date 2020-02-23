import React from 'react'
import { graphql } from '../../lib/graphql/graphql'
import useDocumentAndDrawerTitle from '../../lib/useDocumentAndDrawerTitle'
import useDrawerWithoutPadding from '../../lib/useDrawerWithoutPadding'
import AppTable from '../../app/AppTable'
import { IconButton } from '@material-ui/core'
import OpenInBrowser from '@material-ui/icons/OpenInBrowser'
import { MUIDataTableOptions } from 'mui-datatables'
import useQuery from '../../lib/graphql/useQuery'
import NavLink from '../../lib/mui/NavLink'
import { Query } from '../../lib/graphql/schema.gql'

const UserListView: React.FC = () => {
  useDocumentAndDrawerTitle('Users')
  useDrawerWithoutPadding()

  const query = graphql`
    query Query {
      users {
        id
        username
        roles {
          id
          name
        }
        createdAt
        updatedAt
      }
    }
  `

  const [data, error, loading, retry] = useQuery<Query>({
    query,
  })

  const tableOptions = React.useMemo<MUIDataTableOptions>(() => {
    return {
      serverSide: false,
      count: data?.users?.length,
      filter: false,
      rowsPerPageOptions: [20],
      rowsPerPage: 20,
      responsive: 'scrollMaxHeight',
      customToolbar: () => <CustomToolbar />,
    }
  }, [data])

  if (data) {
    return (
      <div>
        <AppTable className="fullscreen" title="" data={data.users!} options={tableOptions}>
          <AppTable.Column name="id" options={{ display: 'excluded' }} />
          <AppTable.Column name="" options={{ empty: true, filter: false, sort: false }}>
            {(_, meta) => (
              <NavLink href={`/users/${meta.rowData?.[0]}`}>
                <IconButton size="small">
                  <OpenInBrowser />
                </IconButton>
              </NavLink>
            )}
          </AppTable.Column>
          <AppTable.Column name="username" label="Username" />
          <AppTable.Column name="roles" label="Roles">
            {v => `[${v.map((r: any) => r.name).join(', ')}]`}
          </AppTable.Column>
          <AppTable.Column name="updatedAt" label="Updated">
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

export default UserListView

const CustomToolbar: React.FC = () => {
  return (
    <React.Fragment>

    </React.Fragment>
  )
}
