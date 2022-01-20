import { faSave, faLayerGroup } from '@fortawesome/free-solid-svg-icons'
import React, { useContext, useEffect, useMemo } from 'react'
import { Query, Mutation } from '../../assets/schema.gql'
import AppForm, { useAppForm } from '../../lib/AppForm'
import Button from '../../lib/bulma/Button'
import Container from '../../lib/bulma/Container'
import Control from '../../lib/bulma/Control'
import Field from '../../lib/bulma/Field'
import Icon from '../../lib/bulma/Icon'
import Level from '../../lib/bulma/Level'
import Notification from '../../lib/bulma/Notification'
import Section from '../../lib/bulma/Section'
import TagsInput from '../../lib/bulma/TagsInput'
import { H1, Span } from '../../lib/bulma/Text'
import { graphql } from '../../lib/graphql'
import useMutation from '../../lib/graphql/useMutation'
import useQuery from '../../lib/graphql/useQuery'
import useIdParam from '../../lib/useIdParam'
import { Store } from '../../store'
import useAuthorization from '../../store/useAuthorization'

const userQuery = graphql`
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

const updateUserMutation = graphql`
  mutation Mutation($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      id
    }
  }
`

const UserView: React.FC = props => {
  const [store] = useContext(Store)
  const id = useIdParam(props) || store.auth?.user.id
  const isAdmin = useAuthorization('admin')

  const variables = useMemo(() => {
    return {
      id,
    }
  }, [id])

  const [data, error, loading, retry] = useQuery<Query>({
    query: userQuery,
    variables,
  })
  const values = useMemo(() => {
    return {
      ...data?.user,
      roleNames: data?.user?.roles?.map(r => r.name),
    }
  }, [data])

  const { useErrorNotificationEffect, pushError } = useContext(Notification.Portal)
  useErrorNotificationEffect(error, retry)

  const [updateUser] = useMutation<Mutation>({
    query: updateUserMutation,
  })

  const defaultValues = useMemo(() => {
    return {}
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

  const onSubmit = async (newValues: typeof values) => {
    try {
      newValues.roles = newValues?.roleNames
        ?.map(n => {
          return data?.userRoles?.find(r => r.name === n)!
        })
        ?.filter(r => !!r)

      await updateUser({ id, input: newValues })

      retry()
    } catch (error) {
      pushError(error)
    }
  }

  return (
    <Section>
      <Container>
        <H1 kind="title" documentTitle="User Profile" caps>
          <Span>{values?.username}</Span>
        </H1>

        <AppForm form={form} onSubmit={handleSubmit(onSubmit)}>
          <Level mobile>
            <Level.Left>
            </Level.Left>
            <Level.Right>
              <Level.Item>
                <Button type="submit" color="primary" disabled={!canSubmit || !isAdmin} loading={submitting || loading}>
                  <Icon icon={faSave} />
                </Button>
              </Level.Item>
            </Level.Right>
          </Level>

          <Field label="Roles">
            <Control>
              <Icon size="small" icon={faLayerGroup} />
              <TagsInput name="roleNames" /* options={userRoles} */ required readOnly={!isAdmin}
                // getKey={o => o.id}
                // getLabel={o => o.name}
              />
            </Control>
          </Field>
        </AppForm>
      </Container>
    </Section>
  )
}

export default React.memo(UserView)
