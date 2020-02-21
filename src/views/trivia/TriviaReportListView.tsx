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

const UserRoleListView: React.FC = () => {
  useDocumentAndDrawerTitle('Trivia Reports')
  useDrawerWithoutPadding()

  const query = graphql`
    query Query {
      triviaReports {
        id
        question {
          id
        }
        message
        submitter
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
      count: data?.triviaReports?.length,
      filter: false,
      rowsPerPageOptions: [20],
      customToolbar: () => <CustomToolbar />,
    }
  }, [data])

  if (data) {
    return (
      <div>
        <AppTable title="" data={data.triviaReports ?? []} options={tableOptions}>
          <AppTable.Column name="id" options={{ display: 'excluded' }} />
          <AppTable.Column name="question.id" options={{ display: 'excluded' }} />
          <AppTable.Column name="" options={{ empty: true, filter: false, sort: false }}>
            {(_, meta) => (
              <NavLink href={`/trivia/questions/${meta.rowData?.[1]}`}>
                <IconButton size="small">
                  <OpenInBrowser />
                </IconButton>
              </NavLink>
            )}
          </AppTable.Column>
          <AppTable.Column name="message" label="Message" />
          <AppTable.Column name="submitter" label="Submitter" />
          <AppTable.Column name="question.question" label="Question" />
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

export default UserRoleListView

const CustomToolbar: React.FC = () => {
  return (
    <React.Fragment>

    </React.Fragment>
  )
}
