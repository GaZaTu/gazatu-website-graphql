import React, { useContext, useEffect, useMemo } from 'react'
import { useHistory } from 'react-router'
import A from '../lib/bulma/A'
import Button from '../lib/bulma/Button'
import Column from '../lib/bulma/Column'
import Container from '../lib/bulma/Container'
import Control from '../lib/bulma/Control'
import Divider from '../lib/bulma/Divider'
import Field from '../lib/bulma/Field'
import Input from '../lib/bulma/Input'
import Notification from '../lib/bulma/Notification'
import Section from '../lib/bulma/Section'
import { H3 } from '../lib/bulma/Text'
import { graphql } from '../lib/graphql'
import useMutation from '../lib/graphql/useMutation'
import AppForm, { useAppForm } from '../lib/AppForm'
import useAction from '../lib/store/useAction'
import useStoredState from '../lib/useStoredState'
import { Store } from '../store'

const registerUserQuery = graphql`
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
`

const authenticateQuery = graphql`
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
`

type LoginData = {
  username: string
  password: string
}

type RegisterData = {
  username: string
  password: string
  password2: string
}

type AuthData = LoginData & RegisterData

type LoginFormProps = {
  isRegisterForm?: boolean
}

const LoginForm: React.FC<LoginFormProps> = props => {
  const { isRegisterForm } = props
  const { pushError } = useContext(Notification.Portal)
  const history = useHistory()

  const [, dispatch] = useContext(Store)
  const storeAuth = useAction(dispatch, '@@AUTH/LOGIN')

  const [failedLogins, setFailedLogins] = useStoredState('FAILED_LOGINS', {
    attempts: 0,
    timestamp: 0,
    reload: false,
  })

  const locked = useMemo(() => {
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

  const [registerUser] = useMutation({
    query: registerUserQuery,
  })

  const [authenticate] = useMutation({
    query: authenticateQuery,
  })

  const form = useAppForm({
    defaultValues: {
      username: '',
      password: '',
      password2: '',
    },
  })
  const {
    handleSubmit,
    canSubmit,
    submitting,
    getValues,
    setError,
    clearErrors,
  } = form

  const onSubmit = async (values: AuthData) => {
    try {
      let auth: any

      if (isRegisterForm) {
        auth = await registerUser(values)
          .then(r => r.registerUser)
      } else {
        try {
          auth = await authenticate(values)
            .then(r => r.authenticate)

          setFailedLogins(s => ({ ...s, attempts: 0, timestamp: 0 }))
        } catch (error) {
          setFailedLogins(s => ({ ...s, attempts: s.attempts + 1, timestamp: Date.now() }))

          throw error
        }
      }

      storeAuth(auth)
      history.push('/')
    } catch (error) {
      pushError(error)
    }
  }

  const [
    password,
    password2,
  ] = getValues(['password', 'password2'])
  useEffect(() => {
    if (!isRegisterForm) {
      return
    }

    if (password !== password2) {
      setError('password2', { type: 'validate', message: 'Passwords must be equal' })
    } else {
      clearErrors('password2')
    }
  }, [isRegisterForm, password, password2, setError, clearErrors])

  return (
    <AppForm form={form} onSubmit={handleSubmit(onSubmit)} >
      <H3 kind="title" caps>{isRegisterForm ? 'Register' : 'Login'}</H3>

      <Field label="Username">
        <Control>
          <Input type="text" name="username" required minLength={4} />
        </Control>
      </Field>

      <Field label="Password">
        {isRegisterForm && (
          <Field.Label asString="Password" title="sent over TLS1.3, hashed using argon2">Password (<A href="https://github.com/GaZaTu/gazatu-api-graphql-pgsql/blob/master/src/graphql/user/auth/auth.resolver.ts#L91" external>Backend</A>)</Field.Label>
        )}
        <Control>
          <Input type="password" name="password" required minLength={4} />
        </Control>
      </Field>

      {isRegisterForm && (
        <Field label="Repeat Password">
          <Control>
            <Input type="password" name="password2" required minLength={4} />
          </Control>
        </Field>
      )}

      {isRegisterForm && (
        <Field label="I agree to sacrifice my soul and firstborn to dankman overlord pajlada">
          <Control>
            <Input type="checkbox" name="check" required />
          </Control>
        </Field>
      )}

      <Field>
        <Control>
          <Button type="submit" color="primary" disabled={!canSubmit} loading={submitting || locked}>{isRegisterForm ? 'Register' : 'Login'}</Button>
        </Control>
      </Field>
    </AppForm>
  )
}

const LoginView: React.FC = props => {
  return (
    <Section>
      <Container>
        <Column.Row>
          <Column>
            <LoginForm />
          </Column>

          <Divider text="OR" vertical />

          <Column>
            <LoginForm isRegisterForm />
          </Column>
        </Column.Row>
      </Container>
    </Section>
  )
}

export default React.memo(LoginView)
