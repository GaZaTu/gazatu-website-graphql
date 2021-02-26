import React, { useContext, useMemo } from 'react'
import { Grid, Paper, makeStyles, createStyles } from '@material-ui/core'
import { useSnackbar } from 'notistack'
import { Store } from '../store'
import ProgressButton from '../lib/mui/ProgressButton'
import useDocumentAndDrawerTitle from '../lib/useDocumentAndDrawerTitle'
import useMutation from '../lib/graphql/useMutation'
import { graphql } from '../lib/graphql'
import { navigate } from '../lib/hookrouter'
import Form from '../lib/Form'
import FormTextField from '../lib/mui/FormTextField'
import useStoredState from '../lib/useStoredState'

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
    }),
  )

const LoginView: React.FC = props => {
  useDocumentAndDrawerTitle('Login / Register')

  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <LoginForm />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <LoginForm isRegister />
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}

export default React.memo(LoginView)

interface LoginFormProps {
  isRegister?: boolean
}

const LoginForm: React.FC<LoginFormProps> = props => {
  const { isRegister } = props
  const classes = useStyles()
  const [, dispatch] = useContext(Store)
  const { enqueueSnackbar } = useSnackbar()

  const [registerUser] = useMutation({
    query: graphql`
      mutation Mutation($username: String!, $password: String!) {
        registerUser(username: $username, password: $password) {
          token
          user {
            id
            username
            roles {
              name
            }
          }
        }
      }
    `,
  })

  const [authenticate] = useMutation({
    query: graphql`
      query Query($username: String!, $password: String!) {
        authenticate(username: $username, password: $password) {
          token
          user {
            id
            username
            roles {
              name
            }
          }
        }
      }
    `,
  })

  const initialValues = useMemo(() => {
    return {
      username: '',
      password: '',
      password2: '',
    }
  }, [])

  const [failedLogins, setFailedLogins] = useStoredState('FAILED_LOGINS', {
    attempts: 0,
    timestamp: 0,
    reload: false,
  })

  const isLocked = useMemo(() => {
    const secs = (secs: number) => secs * 1000
    const mins = (mins: number) => secs(mins * 60)

    let waitMs = 0

    if (failedLogins.attempts > 12) {
      waitMs = mins(5)
    } else if (failedLogins.attempts > 6) {
      waitMs = mins(1)
    } else if (failedLogins.attempts > 3) {
      waitMs = secs(5)
    }

    if (failedLogins.timestamp > (Date.now() - waitMs)) {
      setTimeout(() => setFailedLogins(s => ({ ...s, reload: !s.reload, })))

      return true
    } else {
      return false
    }
  }, [failedLogins, setFailedLogins])

  const handleSubmit = useMemo(() => {
    return async (values: typeof initialValues) => {
      try {
        let authResult: any

        if (isRegister) {
          authResult = await registerUser(values)
            .then(r => r.registerUser)
        } else {
          try {
            authResult = await authenticate(values)
              .then(r => r.authenticate)

            setFailedLogins(s => ({ ...s, attempts: 0, timestamp: 0 }))
          } catch (e) {
            setFailedLogins(s => ({ ...s, attempts: s.attempts + 1, timestamp: Date.now() }))

            throw e
          }
        }

        dispatch({
          type: '@@AUTH/LOGIN',
          payload: authResult,
        })

        navigate('/')
      } catch (error) {
        enqueueSnackbar(`${error}`, { variant: 'error' })
      }
    }
  }, [authenticate, dispatch, enqueueSnackbar, isRegister, registerUser, setFailedLogins])

  const handleValidate = useMemo(() => {
    return async (values: typeof initialValues) => {
      return {
        password2: (isRegister && values.password2 !== values.password) ? 'Passwords must be equal' : undefined,
      }
    }
  }, [isRegister])

  return (
    <Form initialValues={initialValues} onSubmit={handleSubmit} onValidate={handleValidate}>
      <div>
        <FormTextField type="text" name="username" label="Username" variant="standard" className={classes.field} required />
      </div>

      <div>
        <FormTextField type="password" name="password" label="Password" variant="standard" className={classes.field} required />
      </div>

      {isRegister && (
        <div>
          <FormTextField type="password" name="password2" label="Repeat password" variant="standard" className={classes.field} required />
        </div>
      )}

      <Form.Context.Consumer>
        {({ formState }) => (
          <div>
            <ProgressButton
              variant="contained"
              color="primary"
              type="submit"
              disabled={!formState.isSubmittable}
              loading={formState.isSubmitting || (!isRegister && isLocked)}
            >
              {isRegister ? 'Register' : 'Login'}
            </ProgressButton>
          </div>
        )}
      </Form.Context.Consumer>
    </Form>
  )
}
