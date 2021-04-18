import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons'
import React, { useContext } from 'react'
import Button from '../../lib/bulma/Button'
import Container from '../../lib/bulma/Container'
import Icon from '../../lib/bulma/Icon'
import Notification from '../../lib/bulma/Notification'
import Section from '../../lib/bulma/Section'
import Table from '../../lib/bulma/Table'
import { H1, Span } from '../../lib/bulma/Text'
import { graphql } from '../../lib/graphql'
import { Query } from '../../assets/schema.gql'
import useQuery from '../../lib/graphql/useQuery'

const changesQuery = graphql`
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

const EventLogView: React.FC = props => {
  const [data, error, loading, retry] = useQuery<Query>({
    query: changesQuery,
  })

  const { useErrorNotificationEffect } = useContext(Notification.Portal)
  useErrorNotificationEffect(error, retry)

  return (
    <Section>
      <Container>
        <H1 kind="title" documentTitle>Event-Log</H1>

        <Table className="is-unpadded" data={data?.changes} bordered fullwidth loading={loading} initialState={{ pageSize: 25, hiddenColumns: ['targetId'], sortBy: [{ id: 'createdAt', desc: true }] }} canSelectRows={false} storeStateInQuery>
          <Table.Column Header="" accessor="#0" disableSortBy disableGlobalFilter
            Cell={({ row }) => {
              const { kind, targetEntityName, targetId } = row.original

              const href = (() => {
                switch (targetEntityName) {
                  case 'TriviaQuestion':
                    return `/trivia/questions/${targetId}`
                  default:
                    return undefined
                }
              })()

              if (!href || kind === 'REMOVE') {
                return null
              }

              return (
                <Button as="a" href={href} color="link" size="small">
                  <Icon icon={faExternalLinkSquareAlt} />
                </Button>
              )
            }}
          />
          <Table.Column Header="Kind" accessor="kind"
            Cell={({ value: kind }) => (
              <Span color={kind === 'INSERT' ? 'success' : (kind === 'REMOVE' ? 'danger' : 'warning')}>{kind}</Span>
            )}
          />
          <Table.Column Header="Entity" accessor="targetEntityName" />
          <Table.Column Header="ID" accessor="targetId" />
          <Table.Column Header="Column" accessor="targetColumn" />
          <Table.Column Header="Value" accessor="newColumnValue" />
          <Table.Column Header="Date" accessor="createdAt"
            Cell={({ value: createdAt }) => (
              <Span date={createdAt} />
            )}
          />
        </Table>
      </Container>
    </Section>
  )
}

export default React.memo(EventLogView)
