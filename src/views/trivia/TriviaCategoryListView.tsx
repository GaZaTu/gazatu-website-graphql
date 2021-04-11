import { faCheckCircle, faClipboardCheck, faExternalLinkSquareAlt, faLayerGroup, faObjectGroup, faTrash } from '@fortawesome/free-solid-svg-icons'
import React, { useContext, useMemo, useState } from 'react'
import Button from '../../bulma/Button'
import Container from '../../bulma/Container'
import Control from '../../bulma/Control'
import Field from '../../bulma/Field'
import Icon from '../../bulma/Icon'
import Modal from '../../bulma/Modal'
import Notification from '../../bulma/Notification'
import Section from '../../bulma/Section'
import Select from '../../bulma/Select'
import Table, { TableInstance, useTableSearchParams } from '../../bulma/Table'
import { Div, H1, H2, Span } from '../../bulma/Text'
import { graphql } from '../../graphql'
import { Mutation, Query, TriviaCategory } from '../../graphql/schema.gql'
import useMutation from '../../graphql/useMutation'
import useQuery from '../../graphql/useQuery'
import parseURLSearchParams from '../../lib/parseURLSearchParam'
import useAuthorization from '../../store/useAuthorization'

export const TriviaCategoryNameDiv: React.FC<{ o: TriviaCategory }> = props => {
  const { o } = props

  return (
    <Div>
      <Icon color="success" icon={o.verified ? faClipboardCheck : undefined} />
      <Span>{o.name}</Span>
    </Div>
  )
}

const triviaCategoriesQuery = graphql`
  query Query($isTriviaAdmin: Boolean!, $verified: Boolean, $disabled: Boolean) {
    triviaCategories(verified: $verified, disabled: $disabled) {
      id
      name
      submitter
      verified
      disabled
      createdAt
      updatedAt
      questionsCount @include(if: $isTriviaAdmin)
    }
  }
`

const mergeTriviaCategoriesIntoMutation = graphql`
  mutation Mutation($ids: [ID!]!, $targetId: ID!) {
    mergeTriviaCategoriesInto(ids: $ids, targetId: $targetId) {
      count
    }
  }
`

const verifyTriviaCategoriesMutation = graphql`
  mutation Mutation($ids: [ID!]!) {
    verifyTriviaCategories(ids: $ids) {
      count
    }
  }
`

const removeTriviaCategoriesMutation = graphql`
  mutation Mutation($ids: [ID!]!) {
    removeTriviaCategories(ids: $ids) {
      count
    }
  }
`

const TriviaCategoryListView: React.FC = props => {
  const [isTriviaAdmin] = useAuthorization('trivia-admin')

  const {
    unusedQueryString,
  } = useTableSearchParams()

  const variables = useMemo(() => {
    const {
      verified,
      disabled,
    } = parseURLSearchParams(unusedQueryString)

    return {
      verified,
      disabled,
      isTriviaAdmin,
    }
  }, [unusedQueryString, isTriviaAdmin])

  const [data, error, loading, retry] = useQuery<Query>({
    query: triviaCategoriesQuery,
    variables,
  })

  const { useErrorNotificationEffect, pushError } = useContext(Notification.Portal)
  useErrorNotificationEffect(error, retry)

  const { confirm } = useContext(Modal.Portal)
  const [selectedRows, setSelectedRows] = useState<TableInstance['rows']>([])

  const [mergeTriviaCategoriesInto] = useMutation<Mutation>({
    query: mergeTriviaCategoriesIntoMutation,
  })
  const mergeSelectedRows = useMemo(() => {
    return async () => {
      const state = {
        targetCategory: undefined as any | undefined,
      }

      const [modal] = confirm(
        <Modal.Body head={`Merge ${selectedRows.length} Trivia Categories`}>
          <Field label="Target Category">
            <Control>
              <Icon size="small" icon={faLayerGroup} />
              <Select options={data?.triviaCategories} onChange={v => state.targetCategory = v} filterable required usePortal
                getKey={o => o.id}
                getLabel={o => o.name}
                getLabelElement={(l, o) => (
                  <TriviaCategoryNameDiv o={o} />
                )}
              />
            </Control>
          </Field>
          {selectedRows.map(r => (
            <TriviaCategoryNameDiv key={r.id} o={r.original} />
          ))}
        </Modal.Body>
      )

      if (await modal !== 'OK') {
        return
      }

      if (!state.targetCategory) {
        return
      }

      try {
        await mergeTriviaCategoriesInto({
          targetId: state.targetCategory.id,
          ids: selectedRows.map(r => r.original.id),
        })

        retry()
      } catch (error) {
        pushError(error)
      }
    }
  }, [mergeTriviaCategoriesInto, retry, pushError, confirm, selectedRows, data?.triviaCategories])

  const [verifyTriviaCategories] = useMutation<Mutation>({
    query: verifyTriviaCategoriesMutation,
  })
  const verifySelectedRows = useMemo(() => {
    return async () => {
      const [modal] = confirm(
        <Modal.Body head={`Verify ${selectedRows.length} Trivia Categories?`}>
          {selectedRows.map(r => (
            <TriviaCategoryNameDiv key={r.id} o={r.original} />
          ))}
        </Modal.Body>
      )

      if (await modal !== 'OK') {
        return
      }

      try {
        await verifyTriviaCategories({
          ids: selectedRows.map(r => r.original.id),
        })

        retry()
      } catch (error) {
        pushError(error)
      }
    }
  }, [verifyTriviaCategories, retry, pushError, confirm, selectedRows])

  const [removeTriviaCategories] = useMutation<Mutation>({
    query: removeTriviaCategoriesMutation,
  })
  const deleteSelectedRows = useMemo(() => {
    return async () => {
      const [modal] = confirm(
        <Modal.Body head={`Delete ${selectedRows.length} Trivia Categories?`}>
          {selectedRows.map(r => (
            <TriviaCategoryNameDiv key={r.id} o={r.original} />
          ))}
        </Modal.Body>
      )

      if (await modal !== 'OK') {
        return
      }

      try {
        await removeTriviaCategories({
          ids: selectedRows.map(r => r.original.id),
        })

        retry()
      } catch (error) {
        pushError(error)
      }
    }
  }, [removeTriviaCategories, retry, pushError, confirm, selectedRows])

  return (
    <Section>
      <Container>
        {true && (
          <H1 kind="title" documentTitle caps>Trivia Categories</H1>
        )}
        {unusedQueryString && (
          <H2 kind="subtitle">?{unusedQueryString}</H2>
        )}

        <Table className="is-unpadded" data={data?.triviaCategories} bordered fullwidth loading={loading} canSelectRows={isTriviaAdmin} initialState={{ pageSize: 25, sortBy: [{ id: 'name', desc: false }] }} onSelectedRowsChange={setSelectedRows} storeStateInQuery>
          {isTriviaAdmin && (
            <Table.Toolbar>
              <Button onClick={mergeSelectedRows} color="warning" disabled={!selectedRows.length}>
                <Icon icon={faObjectGroup} />
              </Button>
              <Button onClick={verifySelectedRows} color="success" disabled={!selectedRows.length}>
                <Icon icon={faCheckCircle} />
              </Button>
              <Button onClick={deleteSelectedRows} color="danger" disabled={!selectedRows.length}>
                <Icon icon={faTrash} />
              </Button>
            </Table.Toolbar>
          )}

          <Table.Column Header="" accessor="#0" disableSortBy disableGlobalFilter maxWidth={20}
            Cell={({ row }) => (
              <Button as="a" href={`/trivia/categories/${row.original.id}`} size="small" color="link">
                <Icon icon={faExternalLinkSquareAlt} />
              </Button>
            )}
          />
          <Table.Column Header="Name" accessor="name" />
          <Table.Column Header="Submitter" accessor="submitter" />
          <Table.Column Header="Updated" accessor="updatedAt"
            Cell={({ value: updatedAt }) => (
              <Span date={updatedAt} />
            )}
          />
          {isTriviaAdmin && (
            <Table.Column Header="Questions" accessor="questionsCount" />
          )}
          <Table.Column Header="" accessor="verified" disableSortBy disableGlobalFilter maxWidth={20}
            Cell={({ value: verified }) => (
              <Icon color="success" icon={verified ? faClipboardCheck : undefined} style={{ verticalAlign: 'middle' }} />
            )}
          />
        </Table>
      </Container>
    </Section>
  )
}

export default React.memo(TriviaCategoryListView)
