import { faCheckCircle, faClipboardCheck, faExternalLinkSquareAlt, faLayerGroup, faObjectGroup, faTrash } from '@fortawesome/free-solid-svg-icons'
import React, { useContext, useEffect, useMemo, useState } from 'react'
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
import { Div, H1, Span } from '../../bulma/Text'
import { graphql } from '../../graphql'
import { Mutation, Query, TriviaQuestion } from '../../graphql/schema.gql'
import useMutation from '../../graphql/useMutation'
import useQuery from '../../graphql/useQuery'
import { relayConnectionFragment } from '../../graphql/useRelayConnection'
import useRelayConnectionQuery from '../../graphql/useRelayConnectionQuery'
import parseURLSearchParams from '../../lib/parseURLSearchParam'
import QueryStringSubtitle from '../../lib/QueryStringSubtitle'
import useAuthorization from '../../store/useAuthorization'
import { TriviaCategoryNameDiv } from './TriviaCategoryListView'

export const TriviaQuestionNameDiv: React.FC<{ o: TriviaQuestion }> = props => {
  const { o } = props

  return (
    <Div>
      <Icon color="success" icon={o.verified ? faClipboardCheck : undefined} />
      <Span>{o.question} - {o.answer}</Span>
    </Div>
  )
}

const triviaCategoriesQuery = graphql`
  query Query {
    triviaCategories(verified: true, disabled: false) {
      id
      name
      verified
    }
  }
`

const categorizeTriviaQuestionsMutation = graphql`
  mutation Mutation($ids: [ID!]!, $categoryId: ID!) {
    categorizeTriviaQuestions(ids: $ids, categoryId: $categoryId) {
      count
    }
  }
`

const verifyTriviaQuestionsMutation = graphql`
  mutation Mutation($ids: [ID!]!) {
    verifyTriviaQuestions(ids: $ids) {
      count
    }
  }
`

const removeTriviaQuestionsMutation = graphql`
  mutation Mutation($ids: [ID!]!) {
    removeTriviaQuestions(ids: $ids) {
      count
    }
  }
`

const triviaQuestionsQuery = graphql`
  query Query($after: String, $before: String, $first: Int, $last: Int, $skipPages: Int, $search: String, $sortField: String, $sortDirection: SortDirection, $verified: Boolean, $disabled: Boolean, $reported: Boolean, $dangling: Boolean) {
    triviaQuestions(after: $after, before: $before, first: $first, last: $last, skipPages: $skipPages, search: $search, sortField: $sortField, sortDirection: $sortDirection, verified: $verified, disabled: $disabled, reported: $reported, dangling: $dangling) {
      ${relayConnectionFragment(graphql`
        fragment Fragment on TriviaQuestion {
          id
          category {
            name
            verified
            disabled
          }
          question
          hint1
          hint2
          submitter
          updatedAt
          answer
          verified
        }
      `)}
    }
  }
`

const TriviaQuestionListView: React.FC = props => {
  const isTriviaAdmin = useAuthorization('trivia-admin')

  const {
    unusedQueryString,
    globalFilter,
    pageSize = 25,
    pageIndex = 0,
    sortBy,
  } = useTableSearchParams()

  const variables = useMemo(() => {
    const {
      verified,
      disabled,
      reported,
      dangling,
    } = parseURLSearchParams(unusedQueryString)

    return {
      search: globalFilter,
      sortField: sortBy?.[0]?.id,
      sortDirection: sortBy?.[0]?.desc ? 'DESC' : 'ASC',
      verified,
      disabled,
      reported,
      dangling,
    }
  }, [unusedQueryString, globalFilter, sortBy])

  const [[data, error, loading, retry], [count, , , , setPage]] = useRelayConnectionQuery<TriviaQuestion>({
    query: triviaQuestionsQuery,
    variables,
    pageSize,
  })
  const pageCount = Math.ceil(count / pageSize)

  const { useErrorNotificationEffect, pushError } = useContext(Notification.Portal)
  useErrorNotificationEffect(error, retry)

  useEffect(() => setPage(pageIndex), [setPage, pageIndex])


  const { confirm } = useContext(Modal.Portal)
  const [selectedRows, setSelectedRows] = useState<TableInstance['rows']>([])

  const [triviaQuestionsData] = useQuery<Query>({
    query: triviaCategoriesQuery,
  })

  const [categorizeTriviaQuestions] = useMutation<Mutation>({
    query: categorizeTriviaQuestionsMutation,
  })
  const categorizeSelectedRows = useMemo(() => {
    return async () => {
      const state = {
        targetCategory: undefined as any | undefined,
      }

      const [modal] = confirm(
        <Modal.Body head={`Categorize ${selectedRows.length} Trivia Questions`}>
          <Field label="Target Category">
            <Control>
              <Icon size="small" icon={faLayerGroup} />
              <Select options={triviaQuestionsData?.triviaCategories} onChange={v => state.targetCategory = v} filterable required usePortal
                getKey={o => o.id}
                getLabel={o => o.name}
                getLabelElement={(l, o) => (
                  <TriviaCategoryNameDiv o={o} />
                )}
              />
            </Control>
          </Field>
          {selectedRows.map(r => (
            <TriviaQuestionNameDiv key={r.id} o={r.original} />
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
        await categorizeTriviaQuestions({
          categoryId: state.targetCategory.id,
          ids: selectedRows.map(r => r.original.id),
        })

        retry()
      } catch (error) {
        pushError(error)
      }
    }
  }, [categorizeTriviaQuestions, retry, pushError, confirm, selectedRows, triviaQuestionsData?.triviaCategories])

  const [verifyTriviaQuestions] = useMutation<Mutation>({
    query: verifyTriviaQuestionsMutation,
  })
  const verifySelectedRows = useMemo(() => {
    return async () => {
      const [modal] = confirm(
        <Modal.Body head={`Verify ${selectedRows.length} Trivia Questions?`}>
          {selectedRows.map(r => (
            <TriviaQuestionNameDiv key={r.id} o={r.original} />
          ))}
        </Modal.Body>
      )

      if (await modal !== 'OK') {
        return
      }

      try {
        await verifyTriviaQuestions({
          ids: selectedRows.map(r => r.original.id),
        })

        retry()
      } catch (error) {
        pushError(error)
      }
    }
  }, [verifyTriviaQuestions, retry, pushError, confirm, selectedRows])

  const [removeTriviaQuestions] = useMutation<Mutation>({
    query: removeTriviaQuestionsMutation,
  })
  const deleteSelectedRows = useMemo(() => {
    return async () => {
      const [modal] = confirm(
        <Modal.Body head={`Delete ${selectedRows.length} Trivia Questions?`}>
          {selectedRows.map(r => (
            <TriviaQuestionNameDiv key={r.id} o={r.original} />
          ))}
        </Modal.Body>
      )

      if (await modal !== 'OK') {
        return
      }

      try {
        await removeTriviaQuestions({
          ids: selectedRows.map(r => r.original.id),
        })

        retry()
      } catch (error) {
        pushError(error)
      }
    }
  }, [removeTriviaQuestions, retry, pushError, confirm, selectedRows])

  return (
    <Section>
      <Container>
        <H1 kind="title" documentTitle caps>Trivia Questions</H1>
        <QueryStringSubtitle query={unusedQueryString} />

        <Table className="is-unpadded" data={data} bordered fullwidth loading={loading} canSelectRows={isTriviaAdmin} options={{ pageCount }} initialState={{ pageSize, sortBy: [{ id: 'updatedAt', desc: true }] }} manual onSelectedRowsChange={setSelectedRows} storeStateInQuery>
          {isTriviaAdmin && (
            <Table.Toolbar>
              <Button onClick={categorizeSelectedRows} color="warning" disabled={!selectedRows.length}>
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

          <Table.Column Header="" accessor="#0" disableSortBy disableGlobalFilter
            Cell={({ row }) => (
              <Button as="a" href={`/trivia/questions/${row.original.id}`} size="small" color="link">
                <Icon icon={faExternalLinkSquareAlt} />
              </Button>
            )}
          />
          <Table.Column Header="Category" accessor="category.name" disableSortBy />
          <Table.Column Header="Question" accessor="question" />
          <Table.Column Header="Hint 1" accessor="hint1" />
          <Table.Column Header="Hint 2" accessor="hint2" />
          <Table.Column Header="Submitter" accessor="submitter" />
          <Table.Column Header="Updated" accessor="updatedAt"
            Cell={({ value: updatedAt }) => (
              <Span date={updatedAt} />
            )}
          />
          <Table.Column Header="Answer" accessor="answer" />
          <Table.Column Header="" accessor="verified" disableSortBy disableGlobalFilter
            Cell={({ value: verified }) => (
              <Icon color="success" icon={verified ? faClipboardCheck : undefined} />
            )}
          />
        </Table>
      </Container>
    </Section>
  )
}

export default React.memo(TriviaQuestionListView)
