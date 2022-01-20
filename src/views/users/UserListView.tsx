import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons'
import React, { useContext } from 'react'
import { Query } from '../../assets/schema.gql'
import Button from '../../lib/bulma/Button'
import Container from '../../lib/bulma/Container'
import Icon from '../../lib/bulma/Icon'
import Notification from '../../lib/bulma/Notification'
import Section from '../../lib/bulma/Section'
import Table from '../../lib/bulma/Table'
import { H1, Span } from '../../lib/bulma/Text'
import { graphql } from '../../lib/graphql'
import useQuery from '../../lib/graphql/useQuery'

const usersQuery = graphql`
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

const UserListView: React.FC = props => {
  const [data, error, loading, retry] = useQuery<Query>({
    query: usersQuery,
  })

  const { useErrorNotificationEffect } = useContext(Notification.Portal)
  useErrorNotificationEffect(error, retry)

  return (
    <Section>
      <Container>
        <H1 kind="title" documentTitle caps>Users</H1>

        <Table className="is-unpadded" data={data?.users} bordered fullwidth loading={loading} canSelectRows={false} initialState={{ pageSize: 25, sortBy: [{ id: 'name', desc: false }] }} storeStateInQuery>
          <Table.Column Header="" accessor="#0" disableSortBy disableGlobalFilter maxWidth={20}
            Cell={({ row }) => (
              <Button as="a" href={`/meta/users/${row.original.id}`} size="small" color="link">
                <Icon icon={faExternalLinkSquareAlt} />
              </Button>
            )}
          />
          <Table.Column Header="Name" accessor="username" />
          <Table.Column Header="Roles" accessor="roles"
            Cell={({ value: roles }) => (
              <Span>{`[${roles.map((r: any) => r.name).join(', ')}]`}</Span>
            )}
          />
          <Table.Column Header="Updated" accessor="updatedAt"
            Cell={({ value: updatedAt }) => (
              <Span date={updatedAt} />
            )}
          />
        </Table>
      </Container>
    </Section>
  )
}

export default React.memo(UserListView)
