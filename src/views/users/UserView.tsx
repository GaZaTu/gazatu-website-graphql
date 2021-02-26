import React, { useMemo } from 'react'
import useDocumentAndDrawerTitle from '../../lib/useDocumentAndDrawerTitle'
import useAuthorization from '../../lib/useAuthorization'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { graphql } from '../../lib/graphql'
import useQuery from '../../lib/graphql/useQuery'
import { Query, Mutation } from '../../lib/graphql/schema.gql'
import Form from '../../lib/Form'
import { Toolbar, TextField } from '@material-ui/core'
import FormTextField from '../../lib/mui/FormTextField'
import { useSnackbar } from 'notistack'
import useMutation from '../../lib/graphql/useMutation'
import ProgressIconButton from '../../lib/mui/ProgressIconButton'
import SaveIcon from '@material-ui/icons/Save'
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

const UserView: React.FC<Props> = props => {
  useDocumentAndDrawerTitle('User')

  const classes = useStyles({})
  const { enqueueSnackbar } = useSnackbar()

  const { id } = props
  const [isAdmin, auth] = useAuthorization('admin')
  const readOnly = !(isAdmin || auth?.user.id === id)

  const query = graphql`
    query Query($id: ID!) {
      user(id: $id) {
        id
        username
        roles {
          id
          name
        }
      }
      userRoles {
        id
        name
      }
    }
  `

  const mutation = graphql`
    mutation Mutation($id: ID!, $input: UserInput!) {
      updateUser(id: $id, input: $input) {
        id
      }
    }
  `

  const variables = useMemo(() => {
    return { id }
  }, [id])

  const [data, , loading, retry] = useQuery<Query>({
    query,
    variables,
  })

  const [updateUser] = useMutation<Mutation>({
    query: mutation,
  })

  const initialValues = useMemo(() => {
    return {
      username: '',
      roles: [] as any[],
      ...(data?.user),
    }
  }, [data])

  const handleSubmit = useMemo(() => {
    return async (values: typeof initialValues) => {
      try {
        console.log({ id, input: values })

        await updateUser({ id, input: values })

        retry()
      } catch (error) {
        enqueueSnackbar(`${error}`, { variant: 'error' })
      }
    }
  }, [enqueueSnackbar, retry, updateUser, id])

  return (
    <div>
      <Form initialValues={initialValues} onSubmit={handleSubmit}>
        <Form.Context.Consumer>
          {({ formState, submit }) => (
            <Toolbar>
              <span className={classes.flexGrow1} />

              {/* DELETE */}

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
          <FormTextField type="text" name="username" label="Username" variant="standard" className={classes.field} inputProps={{ readOnly: true }} required />
        </div>

        <div style={{ marginTop: '12px' }}>
          <FormAutocomplete name="roles" options={data?.userRoles ?? []} autoHighlight filterSelectedOptions multiple
            getOptionLabel={o => typeof o === 'string' ? o : o.name}
            renderInput={params => (
              <TextField {...params} label="Roles" className={classes.field} inputProps={{ ...params.inputProps, readOnly }} />
            )} />
        </div>
      </Form>
    </div>
  )
}

export default UserView
