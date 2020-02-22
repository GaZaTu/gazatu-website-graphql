import React, { useMemo, useEffect } from 'react'
import useDocumentAndDrawerTitle from '../../lib/useDocumentAndDrawerTitle'
import { makeStyles, createStyles, Toolbar, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, useMediaQuery, useTheme, Typography, TextField } from '@material-ui/core'
import useAuthorization from '../../lib/useAuthorization'
import { useSnackbar } from 'notistack'
import { graphql } from '../../lib/graphql'
import useQuery from '../../lib/graphql/useQuery'
import useMutation from '../../lib/graphql/useMutation'
import { navigate } from '../../lib/hookrouter'
import Form from '../../lib/Form'
import ProgressIconButton from '../../lib/mui/ProgressIconButton'
import FormTextField from '../../lib/mui/FormTextField'
import SaveIcon from '@material-ui/icons/Save'
import ReportProblemIcon from '@material-ui/icons/ReportProblem'
import AppTable from '../../app/AppTable'
import { Query, Mutation, TriviaReport, TriviaQuestion } from '../../lib/graphql/schema.gql'
// import { SubscriptionClient } from 'subscriptions-transport-ws'
import ProgressButton from '../../lib/mui/ProgressButton'
import Delete from '@material-ui/icons/Delete'
import FormAutocomplete from '../../lib/mui/FormAutocomplete'

const useStyles =
  makeStyles(theme =>
    createStyles({
      root: {
        flexGrow: 1,
      },
      paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
      },
      field: {
        width: '100%',
      },
      flexGrow1: {
        flexGrow: 1,
      },
    }),
  )

interface Props {
  id: string
}

const TriviaQuestionView: React.FC<Props> = ({ id }) => {
  useDocumentAndDrawerTitle('Trivia Question')

  const [, ] = useAuthorization()
  const [isTriviaAdmin] = useAuthorization('trivia-admin')
  const { enqueueSnackbar } = useSnackbar()
  const theme = useTheme()
  const classes = useStyles({})

  const isNew = id === 'new'
  const readOnly = !isNew && !isTriviaAdmin

  const categoriesAndLanguagesQueryFragment = graphql`
    fragment Fragment on Query {
      triviaCategories(disabled: false) {
        id
        name
      }
      languages {
        id
        name
      }
    }
  `

  const query = graphql`
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
      ...${categoriesAndLanguagesQueryFragment}
    }
  `

  const mutation = graphql`
    mutation Mutation($input: TriviaQuestionInput!) {
      saveTriviaQuestion(input: $input) {
        id
      }
    }
  `

  const variables = useMemo(() => {
    return {
      id,
      isNew,
      isTriviaAdmin,
    }
  }, [id, isNew, isTriviaAdmin])

  const [data, error, loading, retry] = useQuery<Query>({
    query,
    variables,
  })

  const [saveTriviaQuestion] = useMutation<Mutation>({
    query: mutation,
  })

  const initialValues = useMemo<Partial<TriviaQuestion>>(() => {
    return {
      name: '',
      category: (() => {
        const value = localStorage.getItem('previousCategory')
        return value && JSON.parse(value)
      })(),
      submitter: (() => {
        const value = localStorage.getItem('previousSubmitter')
        return value && JSON.parse(value)
      })(),
      language: data?.languages?.[0],
      ...(data?.triviaQuestion),
    }
  }, [data])

  const handleSubmit = useMemo(() => {
    return async (values: typeof initialValues) => {
      try {
        const id = await saveTriviaQuestion({ input: values })
          .then(r => r.saveTriviaQuestion?.id)

        localStorage.setItem('previousCategory', JSON.stringify(values.category))
        localStorage.setItem('previousSubmitter', JSON.stringify(values.submitter))

        if (isNew) {
          navigate(`/trivia/questions/${id}`)
        } else {
          retry()
        }
      } catch (error) {
        enqueueSnackbar(`${error}`, { variant: 'error' })
      }
    }
  }, [enqueueSnackbar, initialValues, isNew, retry, saveTriviaQuestion])

  useEffect(() => {
    if (error) {
      enqueueSnackbar(`${error}`, { variant: 'error' })
    }
  }, [error, enqueueSnackbar])

  // useEffect(() => {
  //   const subscription = new SubscriptionClient(process.env.REACT_APP_GRAPHQL_SUBSCRIPTIONS_URL, {
  //     reconnect: true,
  //   })

  //   subscription.request({
  //     query: `
  //       subscription onNewChange($kind: ChangeKind, $targetEntityName: String, $targetId: String, $targetColumn: String) {
  //         newChange(kind: $kind, targetEntityName: $targetEntityName, targetId: $targetId, targetColumn: $targetColumn) {
  //           id
  //           kind
  //           targetEntityName
  //           targetId
  //           targetColumn
  //           newColumnValue
  //           createdAt
  //         }
  //       }
  //     `,
  //     variables: {
  //       kind: 'UPDATE',
  //       targetEntityName: 'TriviaQuestion',
  //       targetId: id,
  //       targetColumn: null,
  //     },
  //   }).subscribe({
  //     next: console.log,
  //     error: console.error,
  //     complete: () => console.warn('complete'),
  //   })

  //   return () => {
  //     subscription.close()
  //   }
  // }, [id])

  const fullScreenDialog = useMediaQuery(theme.breakpoints.down('sm'))

  const [reportDialogOpen, setReportDialogOpen] = React.useState(false)

  const handleReportDialogOpen = () =>
    setReportDialogOpen(true)

  const handleReportDialogClose = () =>
    setReportDialogOpen(false)

  const initialReportValues = useMemo(() => {
    return {
      questionId: data?.triviaQuestion?.id,
    }
  }, [data])

  const reportTriviaQuestionMutation = graphql`
    mutation Mutation($input: TriviaReportInput!) {
      reportTriviaQuestion(input: $input) {
        id
      }
    }
  `

  const [reportTriviaQuestion] = useMutation<Mutation>({
    query: reportTriviaQuestionMutation,
  })

  const handleReportSubmit = useMemo(() => {
    return async (values: typeof initialReportValues) => {
      try {
        await reportTriviaQuestion({ input: values })

        retry()
        setReportDialogOpen(false)
      } catch (error) {
        enqueueSnackbar(`${error}`, { variant: 'error' })
      }
    }
  }, [enqueueSnackbar, initialReportValues, reportTriviaQuestion, setReportDialogOpen, retry])

  return (
    <div>
      <Form initialValues={initialValues} onSubmit={handleSubmit}>
        <Form.Context.Consumer>
          {({ formState, submit }) => (
            <Toolbar>
              <span className={classes.flexGrow1} />

              <IconButton
                type="button"
                onClick={handleReportDialogOpen}
                disabled={isNew}
              >
                <ReportProblemIcon />
              </IconButton>

              <ProgressIconButton
                type="button"
                color="primary"
                onClick={submit}
                disabled={!formState.isSubmittable || readOnly}
                loading={formState.isSubmitting || loading}
              >
                <SaveIcon />
              </ProgressIconButton>
            </Toolbar>
          )}
        </Form.Context.Consumer>

        <div>
          <FormAutocomplete name="category" options={data?.triviaCategories ?? []} getOptionLabel={o => typeof o === 'string' ? o : o.name} autoHighlight filterSelectedOptions
            renderInput={params => (
              <TextField {...params} label="Category" className={classes.field} inputProps={{ ...params.inputProps, readOnly }} required />
            )} />
        </div>

        <div>
          <FormTextField type="text" name="question" label="Question" className={classes.field} inputProps={{ readOnly }} required />
        </div>

        <div>
          <FormTextField type="text" name="answer" label="Answer" className={classes.field} inputProps={{ readOnly }} required />
        </div>

        <div>
          <FormTextField type="text" name="hint1" label="Hint 1" className={classes.field} inputProps={{ readOnly }} />
        </div>

        <div>
          <FormTextField type="text" name="hint2" label="Hint 2" className={classes.field} inputProps={{ readOnly }} />
        </div>

        <div>
          <FormTextField type="text" name="submitter" label="Submitter" className={classes.field} inputProps={{ readOnly }} />
        </div>

        <div>
          <FormTextField select name="language" label="Language" options={data?.languages} optionId={(o: any) => o.id} className={classes.field} required disabled>
            <MenuItem />
            {data?.languages?.map((o: any) => (
              <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>
            ))}
          </FormTextField>
        </div>
      </Form>

      {data?.triviaQuestion?.category && !data.triviaQuestion.category.verified && (
        <Typography color="error">
          <br />
          <span>Warning: Selected category is not verified.</span>
        </Typography>
      )}

      {data?.triviaQuestion?.category && data.triviaQuestion.category.disabled && (
        <Typography color="error">
          <br />
          <span>Warning: Selected category is disabled. (name="{data.triviaQuestion.category.name}")</span>
        </Typography>
      )}

      <br />

      {data?.triviaQuestion?.reports && (() => {
        const tableOptions = {
          pagination: false,
          search: false,
          filter: false,
          viewColumns: false,
          customToolbar: () => <ReportsCustomToolbar reports={data?.triviaQuestion?.reports ?? []} reload={retry} />,
        }

        return (
          <div>
            <AppTable title="Reports" data={data?.triviaQuestion?.reports} options={tableOptions}>
              <AppTable.Column name="id" options={{ display: 'excluded' }} />
              <AppTable.Column name="message" label="Message" />
              <AppTable.Column name="submitter" label="Submitter" />
              <AppTable.Column name="updatedAt" label="Updated" >
                {v => new Date(v).toLocaleDateString()}
              </AppTable.Column>
            </AppTable>
          </div>
        )
      })()}

      {id && (
        <Dialog open={reportDialogOpen} onClose={handleReportDialogClose} maxWidth="xl" fullScreen={fullScreenDialog}>
          <Form initialValues={initialReportValues} onSubmit={handleReportSubmit}>
            <DialogTitle>Report Trivia Question</DialogTitle>
            <DialogContent>
              <div>
                <FormTextField type="text" name="message" label="Message" className={classes.field} required />
              </div>

              <div>
                <FormTextField type="text" name="submitter" label="Submitter" className={classes.field} required />
              </div>
            </DialogContent>
            <DialogActions>
              <Form.Context.Consumer>
                {({ formState, submit, reset }) => (
                  <React.Fragment>
                    <Button
                      type="button"
                      onClick={() => { reset(); handleReportDialogClose(); }}
                    >
                      Cancel
                    </Button>

                    <ProgressButton
                      type="button"
                      onClick={submit}
                      disabled={!formState.isSubmittable}
                      loading={formState.isSubmitting}
                    >
                      Submit
                    </ProgressButton>
                  </React.Fragment>
                )}
              </Form.Context.Consumer>
            </DialogActions>
          </Form>
        </Dialog>
      )}
    </div>
  )
}

export default TriviaQuestionView

const ReportsCustomToolbar: React.FC<{ reload: () => void, reports: TriviaReport[] }> = props => {
  const { reload, reports } = props

  const [removeTriviaReports] = useMutation({
    query: graphql`
      mutation Mutation($ids: [ID!]!) {
        removeTriviaReports(ids: $ids) {
          count
        }
      }
    `,
  })

  const handleRemoveTriviaReports = React.useMemo(() => {
    return async () => {
      await removeTriviaReports({ ids: reports.map(r => r.id) })
      reload()
    }
  }, [reload, reports, removeTriviaReports])

  return (
    <React.Fragment>
      <IconButton onClick={handleRemoveTriviaReports}>
        <Delete />
      </IconButton>
    </React.Fragment>
  )
}
