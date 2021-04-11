import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons'
import React, { useContext } from 'react'
import Button from '../../bulma/Button'
import Container from '../../bulma/Container'
import Icon from '../../bulma/Icon'
import Notification from '../../bulma/Notification'
import Section from '../../bulma/Section'
import Table from '../../bulma/Table'
import { H1, Span } from '../../bulma/Text'
import { graphql } from '../../graphql'
import { Query } from '../../graphql/schema.gql'
import useQuery from '../../graphql/useQuery'

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

        <Table className="is-unpadded" data={data?.changes} bordered fullwidth loading={loading} initialState={{ pageSize: 25, hiddenColumns: ['targetId'] }} canSelectRows={false} storeStateInQuery>
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

              return href && kind !== 'REMOVE' && (
                <Button as="a" href={href}>
                  <Icon icon={faExternalLinkSquareAlt} />
                </Button>
              )
            }}
          />
          <Table.Column Header="Kind" accessor="kind" />
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
