import React, { useMemo } from 'react'
import useDocumentAndDrawerTitle from '../../lib/useDocumentAndDrawerTitle'
import { graphql } from '../../lib/graphql'
import useQuery from '../../lib/graphql/useQuery'
import useMutation from '../../lib/graphql/useMutation'
import useAuthorization from '../../lib/useAuthorization'
import { useSnackbar } from 'notistack'
import { navigate } from '../../lib/hookrouter'
import { makeStyles, createStyles, Toolbar, IconButton } from '@material-ui/core'
import ProgressIconButton from '../../lib/mui/ProgressIconButton'
import SaveIcon from '@material-ui/icons/Save'
import Form from '../../lib/Form'
import FormTextField from '../../lib/mui/FormTextField'
import { Query, Mutation } from '../../lib/graphql/schema.gql'
import AppTable from '../../app/AppTable'
import NavLink from '../../lib/mui/NavLink'
import OpenInBrowser from '@material-ui/icons/OpenInBrowser'

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

const TriviaCategoryView: React.FC<Props> = ({ id }) => {
  useDocumentAndDrawerTitle('Trivia Category')

  const [, ] = useAuthorization()
  const [isTriviaAdmin] = useAuthorization('trivia-admin')
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles({})

  const isNew = id === 'new'
  const readOnly = !isNew && !isTriviaAdmin

  const query = graphql`
    query Query($id: ID!) {
      triviaCategory(id: $id) {
        id
        name
        submitter
        verified
        disabled
        createdAt
        updatedAt
        questions {
          id
          question
          hint1
          hint2
          answer
        }
      }
    }
  `

  const mutation = graphql`
    mutation Mutation($input: TriviaCategoryInput!) {
      saveTriviaCategory(input: $input) {
        id
      }
    }
  `

  const variables = useMemo(() => {
    return isNew ? undefined : { id }
  }, [id, isNew])

  const [data, , loading, retry] = useQuery<Query>({
    query,
    variables,
  })

  const [saveTriviaCategory] = useMutation<Mutation>({
    query: mutation,
  })

  const initialValues = React.useMemo(() => {
    return {
      name: '',
      submitter: null as string | null,
      ...(data?.triviaCategory),
    }
  }, [data])

  const handleSubmit = React.useMemo(() => {
    return async (values: typeof initialValues) => {
      try {
        const id = await saveTriviaCategory({ input: values })
          .then(r => r.saveTriviaCategory?.id)

        if (isNew) {
          navigate(`/trivia/categories/${id}`)
        } else {
          retry()
        }
      } catch (error) {
        enqueueSnackbar(`${error}`, { variant: 'error' })
      }
    }
  }, [enqueueSnackbar, initialValues, isNew, retry, saveTriviaCategory])

  return (
    <div>
      <Form initialValues={initialValues} onSubmit={handleSubmit}>
        <Form.Context.Consumer>
          {({ formState, submit }) => (
            <Toolbar>
              <span className={classes.flexGrow1} />

              <ProgressIconButton
                type="button"
                color="primary"
                onClick={() => submit()}
                disabled={!formState.isSubmittable || readOnly}
                loading={formState.isSubmitting || loading}
              >
                <SaveIcon />
              </ProgressIconButton>
            </Toolbar>
          )}
        </Form.Context.Consumer>

        <div>
          <FormTextField type="text" name="name" label="Name" className={classes.field} inputProps={{ readOnly }} required />
        </div>

        <div>
          <FormTextField type="text" name="submitter" label="Submitter" className={classes.field} inputProps={{ readOnly }} />
        </div>
      </Form>

      <br />

      {data?.triviaCategory?.questions && (
        <div>
          <AppTable title="Questions" data={data?.triviaCategory?.questions ?? []} options={{ filter: false, viewColumns: false }}>
            <AppTable.Column name="id" options={{ display: 'excluded' }} />
            <AppTable.Column name="" options={{ empty: true, filter: false, sort: false }}>
              {(_, meta) => (
                <NavLink href={`/trivia/questions/${meta.rowData?.[0]}`}>
                  <IconButton size="small">
                    <OpenInBrowser />
                  </IconButton>
                </NavLink>
              )}
            </AppTable.Column>
            <AppTable.Column name="question" label="Question" />
            <AppTable.Column name="hint1" label="Hint 1" />
            <AppTable.Column name="hint2" label="Hint 2" />
            <AppTable.Column name="answer" label="Answer" />
          </AppTable>
        </div>
      )}
    </div>
  )
}

export default TriviaCategoryView
