import { faCheckCircle, faClipboardCheck, faExternalLinkSquareAlt, faSave, faTrash } from '@fortawesome/free-solid-svg-icons'
import React, { useContext, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import Button from '../../lib/bulma/Button'
import Container from '../../lib/bulma/Container'
import Control from '../../lib/bulma/Control'
import Field from '../../lib/bulma/Field'
import Icon from '../../lib/bulma/Icon'
import Input from '../../lib/bulma/Input'
import Level from '../../lib/bulma/Level'
import Modal from '../../lib/bulma/Modal'
import Notification from '../../lib/bulma/Notification'
import Section from '../../lib/bulma/Section'
import Table from '../../lib/bulma/Table'
import { H1, H4, Span } from '../../lib/bulma/Text'
import { graphql } from '../../lib/graphql'
import { Mutation, Query, TriviaCategoryInput } from '../../assets/schema.gql'
import useMutation from '../../lib/graphql/useMutation'
import useQuery from '../../lib/graphql/useQuery'
import AppForm, { useAppForm } from '../../lib/AppForm'
import useIdParam from '../../lib/useIdParam'
import useStoredState from '../../lib/useStoredState'
import useAuthorization from '../../store/useAuthorization'
import { TriviaCategoryNameDiv } from './TriviaCategoryListView'

const triviaCategoryQuery = graphql`
  query Query($id: ID!, $isNew: Boolean!) {
    triviaCategory(id: $id) @skip(if: $isNew) {
      id
      name
      description
      submitter
      verified
      disabled
      createdAt
      updatedAt
      questions @skip(if: true) {
        id
        question
        hint1
        hint2
        answer
        verified
      }
    }
  }
`

const saveTriviaCategoryMutation = graphql`
  mutation Mutation($input: TriviaCategoryInput!) {
    saveTriviaCategory(input: $input) {
      id
    }
  }
`

const verifyTriviaCategoryMutation = graphql`
  mutation Mutation($id: ID!) {
    verifyTriviaCategories(ids: [$id]) {
      count
    }
  }
`

const removeTriviaCategoryMutation = graphql`
  mutation Mutation($id: ID!) {
    removeTriviaCategories(ids: [$id]) {
      count
    }
  }
`

const TriviaCategoryView: React.FC = props => {
  const id = useIdParam(props)
  const isTriviaAdmin = useAuthorization('trivia-admin')
  const readOnly = !!id && !isTriviaAdmin

  const variables = useMemo(() => {
    return {
      id,
      isNew: !id,
    }
  }, [id])

  const [data, error, loading, retry] = useQuery<Query>({
    query: triviaCategoryQuery,
    variables,
  })
  const values = data?.triviaCategory

  const history = useHistory()
  const { useErrorNotificationEffect, pushError, pushSuccess } = useContext(Notification.Portal)
  useErrorNotificationEffect(error, retry)

  const [saveTriviaCategory] = useMutation<Mutation>({
    query: saveTriviaCategoryMutation,
  })

  const { confirm } = useContext(Modal.Portal)

  const [verifyTriviaCategory] = useMutation<Mutation>({
    query: verifyTriviaCategoryMutation,
  })
  const verifyThis = useMemo(() => {
    return async () => {
      const [modal] = confirm(
        <Modal.Body head={`Verify Trivia Category?`}>
          <TriviaCategoryNameDiv o={values!} />
        </Modal.Body>
      )

      if (await modal !== 'OK') {
        return
      }

      try {
        await verifyTriviaCategory({
          id: values!.id,
        })

        retry()
      } catch (error) {
        pushError(error)
      }
    }
  }, [verifyTriviaCategory, retry, pushError, confirm, values])

  const [removeTriviaCategory] = useMutation<Mutation>({
    query: removeTriviaCategoryMutation,
  })
  const deleteThis = useMemo(() => {
    return async () => {
      const [modal] = confirm(
        <Modal.Body head={`Delete Trivia Category?`}>
          <TriviaCategoryNameDiv o={values!} />
        </Modal.Body>
      )

      if (await modal !== 'OK') {
        return
      }

      try {
        await removeTriviaCategory({
          id: values!.id,
        })

        history.push('/trivia/categories')
      } catch (error) {
        pushError(error)
      }
    }
  }, [removeTriviaCategory, history, pushError, confirm, values])

  const [previousSubmitter, setPreviousSubmitter] = useStoredState<string | null>('previousSubmitter')

  const defaultValues = useMemo(() => {
    return {
      submitter: previousSubmitter,
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const form = useAppForm({
    defaultValues,
  })
  const {
    handleSubmit,
    canSubmit,
    submitting,
    reset,
  } = form

  useEffect(() => reset(values), [reset, values])

  const onSubmit = async (values: TriviaCategoryInput) => {
    try {
      setPreviousSubmitter(values.submitter)

      const newId = await saveTriviaCategory({ input: values })
        .then(r => r.saveTriviaCategory?.id)

      if (id) {
        retry()
      } else {
        pushSuccess('Trivia Category submitted')

        history.push(`/trivia/categories/${newId}`)
      }
    } catch (error) {
      pushError(error)
    }
  }

  return (
    <>
      <Section>
        <Container>
          <H1 kind="title" documentTitle="Trivia Category" caps>
            <Span>Trivia Category</Span>
            <Icon color="success" icon={values?.verified ? faClipboardCheck : undefined} />
          </H1>

          <AppForm form={form} onSubmit={handleSubmit(onSubmit)}>
            <Level mobile>
              <Level.Left />
              <Level.Right>
                {isTriviaAdmin && (
                  <>
                    <Level.Item>
                      <Button type="button" color="success" onClick={verifyThis} disabled={!values} loading={submitting || loading}>
                        <Icon icon={faCheckCircle} />
                      </Button>
                    </Level.Item>
                    <Level.Item>
                      <Button type="button" color="danger" onClick={deleteThis} disabled={!values} loading={submitting || loading}>
                        <Icon icon={faTrash} />
                      </Button>
                    </Level.Item>
                  </>
                )}

                <Level.Item>
                  <Button type="submit" color="primary" disabled={!canSubmit || readOnly} loading={submitting || loading}>
                    <Icon icon={faSave} />
                  </Button>
                </Level.Item>
              </Level.Right>
            </Level>

            <Field label="Name">
              <Control>
                <Input name="name" type="text" required minLength={3} readOnly={readOnly} />
              </Control>
            </Field>

            <Field label="Description">
              <Control>
                <Input name="description" type="text" readOnly={readOnly} />
              </Control>
            </Field>

            <Field label="Submitter">
              <Control>
                <Input name="submitter" type="text" readOnly={readOnly} />
              </Control>
            </Field>
          </AppForm>
        </Container>
      </Section>
      {values?.questions && (
        <Section>
          <Container>
            <H4 caps>Questions</H4>

            <Table data={values.questions} bordered fullwidth canSelectRows={false} canHideColumns={false} pagination={false} filter={false} hasStickyToolbars={false} initialState={{ sortBy: [{ id: 'updatedAt', desc: true }] }}>
              <Table.Column Header="" accessor="#0" disableSortBy disableGlobalFilter
                Cell={({ row }) => (
                  <Button as="a" href={`/trivia/questions/${row.original.id}`} size="small" color="link">
                    <Icon icon={faExternalLinkSquareAlt} />
                  </Button>
                )}
              />
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
      )}
    </>
  )
}

export default React.memo(TriviaCategoryView)
