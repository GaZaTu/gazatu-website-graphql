import { faCheckCircle, faClipboardCheck, faExclamation, faExclamationTriangle, faFlag, faLayerGroup, faQuestion, faSave, faTrash } from '@fortawesome/free-solid-svg-icons'
import React, { useContext, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import A from '../../lib/bulma/A'
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
import Select from '../../lib/bulma/Select'
import Table from '../../lib/bulma/Table'
import { H1, H4, Span } from '../../lib/bulma/Text'
import { graphql } from '../../lib/graphql'
import { Mutation, Query, TriviaCategory, TriviaQuestion, TriviaQuestionInput, TriviaReportInput } from '../../assets/schema.gql'
import useMutation from '../../lib/graphql/useMutation'
import useQuery from '../../lib/graphql/useQuery'
import AppForm, { useAppForm } from '../../lib/AppForm'
import useIdParam from '../../lib/useIdParam'
import useStoredState from '../../lib/useStoredState'
import useAuthorization from '../../store/useAuthorization'
import { TriviaCategoryNameDiv } from './TriviaCategoryListView'
import { TriviaQuestionNameDiv } from './TriviaQuestionListView'

const triviaQuestionQuery = graphql`
  query Query($id: ID!, $isNew: Boolean!, $isTriviaAdmin: Boolean!) {
    triviaQuestion(id: $id) @skip(if: $isNew) {
      id
      question
      answer
      category {
        id
        name
        verified
        disabled
      }
      language {
        id
        name
      }
      hint1
      hint2
      submitter
      verified
      disabled
      createdAt
      updatedAt
      reports @include(if: $isTriviaAdmin) {
        id
        message
        submitter
        createdAt
        updatedAt
      }
    }
    triviaCategories(disabled: false, verified: null) {
      id
      name
      verified
    }
    languages {
      id
      name
    }
  }
`

const saveTriviaQuestionMutation = graphql`
  mutation Mutation($input: TriviaQuestionInput!) {
    saveTriviaQuestion(input: $input) {
      id
    }
  }
`

const verifyTriviaQuestionMutation = graphql`
  mutation Mutation($id: ID!) {
    verifyTriviaQuestions(ids: [$id]) {
      count
    }
  }
`

const removeTriviaQuestionMutation = graphql`
  mutation Mutation($id: ID!) {
    removeTriviaQuestions(ids: [$id]) {
      count
    }
  }
`

const reportTriviaQuestionMutation = graphql`
  mutation Mutation($input: TriviaReportInput!) {
    reportTriviaQuestion(input: $input) {
      id
    }
  }
`

const removeTriviaReportsMutation = graphql`
  mutation Mutation($ids: [ID!]!) {
    removeTriviaReports(ids: $ids) {
      count
    }
  }
`

type TriviaQuestionReportFormProps = {
  question: TriviaQuestion
  onSubmit: () => void
  onCancel: () => void
}

const TriviaQuestionReportForm: React.FC<TriviaQuestionReportFormProps> = props => {
  const { pushError } = useContext(Notification.Portal)
  const [reportTriviaQuestion] = useMutation<Mutation>({
    query: reportTriviaQuestionMutation,
  })

  const [previousSubmitter, setPreviousSubmitter] = useStoredState<string | null>('previousSubmitter')

  const defaultValues = useMemo(() => {
    return {
      questionId: props.question.id,
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
  } = form

  const onSubmit = async (values: TriviaReportInput) => {
    try {
      if (!values.message || !values.submitter) {
        return
      }

      setPreviousSubmitter(values.submitter)

      await reportTriviaQuestion({ input: values })

      props.onSubmit()
    } catch (error) {
      pushError(error)
    }
  }

  return (
    <Section>
      <Container>
        <H1 kind="title">Report Trivia Question</H1>

        <AppForm form={form} onSubmit={handleSubmit(onSubmit)}>
          <Field label="Question">
            <TriviaQuestionNameDiv o={props.question} />
          </Field>

          <Field label="Message">
            <Control>
              <Input name="message" type="text" required minLength={3} />
            </Control>
          </Field>

          <Field label="Submitter">
            <Control>
              <Input name="submitter" type="text" required minLength={3} />
            </Control>
          </Field>

          <Field>
            <Button.Group>
              <Button type="submit" color="primary" disabled={!canSubmit} loading={submitting}>Submit</Button>
              <Button type="button" onClick={props.onCancel} loading={submitting}>Cancel</Button>
            </Button.Group>
          </Field>
        </AppForm>
      </Container>
    </Section>
  )
}

const TriviaQuestionView: React.FC = props => {
  const id = useIdParam(props)
  const isTriviaAdmin = useAuthorization('trivia-admin')
  const readOnly = !!id && !isTriviaAdmin

  const variables = useMemo(() => {
    return {
      id,
      isNew: !id,
      isTriviaAdmin,
    }
  }, [id, isTriviaAdmin])

  const [data, error, loading, retry] = useQuery<Query>({
    query: triviaQuestionQuery,
    variables,
  })
  const values = id ? data?.triviaQuestion : undefined

  const { useErrorNotificationEffect, pushError, pushSuccess } = useContext(Notification.Portal)
  useErrorNotificationEffect(error, retry)

  const [saveTriviaQuestion] = useMutation<Mutation>({
    query: saveTriviaQuestionMutation,
  })

  const history = useHistory()
  const { confirm, showModal } = useContext(Modal.Portal)

  const [verifyTriviaQuestion] = useMutation<Mutation>({
    query: verifyTriviaQuestionMutation,
  })
  const verifyThis = useMemo(() => {
    return async () => {
      const [modal] = confirm(
        <Modal.Body head={`Verify Trivia Question?`}>
          <TriviaQuestionNameDiv o={values!} />
        </Modal.Body>
      )

      if (await modal !== 'OK') {
        return
      }

      try {
        await verifyTriviaQuestion({
          id: values!.id,
        })

        retry()
      } catch (error) {
        pushError(error)
      }
    }
  }, [verifyTriviaQuestion, retry, pushError, confirm, values])

  const [removeTriviaQuestion] = useMutation<Mutation>({
    query: removeTriviaQuestionMutation,
  })
  const deleteThis = useMemo(() => {
    return async () => {
      const [modal] = confirm(
        <Modal.Body head={`Delete Trivia Question?`}>
          <TriviaQuestionNameDiv o={values!} />
        </Modal.Body>
      )

      if (await modal !== 'OK') {
        return
      }

      try {
        await removeTriviaQuestion({
          id: values!.id,
        })

        history.push('/trivia/questions')
      } catch (error) {
        pushError(error)
      }
    }
  }, [removeTriviaQuestion, history, pushError, confirm, values])

  const reportThis = useMemo(() => {
    return async () => {
      if (!values) {
        return
      }

      const [modal, resolve, reject] = showModal(
        <TriviaQuestionReportForm question={values} onSubmit={() => resolve(undefined)} onCancel={() => reject()} />
      )

      await modal

      pushSuccess('Trivia Question reported')
    }
  }, [showModal, values, pushSuccess])

  const [removeTriviaReports] = useMutation<Mutation>({
    query: removeTriviaReportsMutation,
  })
  const deleteReports = useMemo(() => {
    return async () => {
      const [modal] = confirm(
        <Modal.Body head={`Delete Reports?`} />
      )

      if (await modal !== 'OK') {
        return
      }

      try {
        await removeTriviaReports({
          ids: values!.reports?.map(report => report.id),
        })

        retry()
      } catch (error) {
        pushError(error)
      }
    }
  }, [removeTriviaReports, retry, pushError, confirm, values])

  const [previousCategory, setPreviousCategory] = useStoredState<TriviaCategory>('previousCategory')
  const [previousSubmitter, setPreviousSubmitter] = useStoredState<string | null>('previousSubmitter')
  const [submitMultiple, setSubmitMultiple] = useStoredState<boolean>('submitMultiple', false)

  const defaultValues = useMemo(() => {
    return {
      category: previousCategory,
      submitter: previousSubmitter,
      language: {
        id: 'TGFuZ3VhZ2U6NzVjNjdiMWUtMTA3Yy00ZWNkLTg0ZmEtYTdlODBiZWIwYjgx',
        name: 'English',
      },
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

  const onSubmit = async (values: TriviaQuestionInput) => {
    try {
      setPreviousCategory(values.category)
      setPreviousSubmitter(values.submitter)

      const newId = await saveTriviaQuestion({ input: values })
        .then(r => r.saveTriviaQuestion?.id)

      if (id) {
        retry()
      } else {
        pushSuccess('Trivia Question submitted')

        if (submitMultiple) {
          reset()
        } else {
          history.push(`/trivia/questions/${newId}`)
        }
      }
    } catch (error) {
      pushError(error)
    }
  }

  return (
    <>
      <Section>
        <Container>
          <H1 kind="title" documentTitle="Trivia Question" caps>
            <Span>Trivia Question</Span>
            <Icon color="success" icon={values?.verified ? faClipboardCheck : undefined} />
          </H1>

          <AppForm form={form} onSubmit={handleSubmit(onSubmit)}>
            <Level mobile>
              <Level.Left>
                {!id && (
                  <Level.Item>
                    <Input type="checkbox" placeholder="Submit multiple" checked={submitMultiple} onValueChange={setSubmitMultiple} />
                  </Level.Item>
                )}
              </Level.Left>
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
                  <Button type="button" color="warning" onClick={reportThis} disabled={!values} loading={submitting || loading}>
                    <Icon icon={faFlag} />
                  </Button>
                </Level.Item>
                <Level.Item>
                  <Button type="submit" color="primary" disabled={!canSubmit || readOnly} loading={submitting || loading}>
                    <Icon icon={faSave} />
                  </Button>
                </Level.Item>
              </Level.Right>
            </Level>

            <Field label="Category">
              <Field.Label asString="Category">Category (<A href="/trivia/categories/new">Submit new</A>)</Field.Label>
              <Control>
                <Icon size="small" icon={faLayerGroup} />
                <Select name="category" options={data?.triviaCategories} filterable required readOnly={readOnly}
                  getKey={o => o.id}
                  getLabel={o => o.name}
                  getLabelElement={(l, o) => (
                    <TriviaCategoryNameDiv o={o} />
                  )}
                />
              </Control>
            </Field>

            {/* <Field label="Tags">
              <Control>
                <Icon size="small" icon={faTags} />
                <TagsInput name="tags" readOnly={readOnly} />
              </Control>
            </Field> */}

            <Field label="Question">
              <Control>
                <Icon size="small" icon={faQuestion} />
                <Input name="question" type="text" required minLength={3} readOnly={readOnly} />
              </Control>
            </Field>

            <Field label="Answer">
              <Control>
                <Icon size="small" icon={faExclamation} />
                <Input name="answer" type="text" required minLength={3} readOnly={readOnly} />
              </Control>
            </Field>

            <Field label="Hint 1">
              <Control>
                <Input name="hint1" type="text" readOnly={readOnly} />
              </Control>
            </Field>

            <Field label="Hint 2">
              <Control>
                <Input name="hint2" type="text" readOnly={readOnly} />
              </Control>
            </Field>

            <Field label="Submitter">
              <Control>
                <Input name="submitter" type="text" readOnly={readOnly} />
              </Control>
            </Field>

            <Field label="Language">
              <Control>
                <Input value="English" type="text" disabled />
              </Control>
            </Field>

            {(values?.category && !values.category.verified) && (
              <Field>
                <Span color="warning">
                  <Icon icon={faExclamationTriangle} />
                  <Span>Warning: Selected category is not verified</Span>
                </Span>
              </Field>
            )}

            {(values?.category && values.category.disabled) && (
              <Field>
                <Span color="danger">
                  <Icon icon={faExclamationTriangle} />
                  <Span>Warning: Selected category is disabled</Span>
                </Span>
              </Field>
            )}
          </AppForm>
        </Container>
      </Section>
      {values?.reports && (
        <Section>
          <Container>
            <H4 caps>Reports</H4>

            <Table data={values.reports} bordered fullwidth canSelectRows={false} pagination={false} filter={false} hasStickyToolbars={false} initialState={{ sortBy: [{ id: 'updatedAt', desc: true }] }}>
              <Table.Toolbar>
                <Button type="button" color="danger" onClick={deleteReports} disabled={!values} loading={submitting || loading}>
                  <Icon icon={faTrash} />
                </Button>
              </Table.Toolbar>

              <Table.Column Header="Message" accessor="message" />
              <Table.Column Header="Submitter" accessor="submitter" />
              <Table.Column Header="Updated" accessor="updatedAt"
                Cell={({ value: updatedAt }) => (
                  <Span date={updatedAt} />
                )}
              />
            </Table>
          </Container>
        </Section>
      )}
    </>
  )
}

export default React.memo(TriviaQuestionView)
