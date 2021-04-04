import React from 'react'
import Button from '../../bulma/Button'
import Container from '../../bulma/Container'
import Control from '../../bulma/Control'
import Divider from '../../bulma/Divider'
import Field from '../../bulma/Field'
import Form from '../../bulma/Form'
import Icon from '../../bulma/Icon'
import Input from '../../bulma/Input'
import Level from '../../bulma/Level'
import Section from '../../bulma/Section'
import Select from '../../bulma/Select'
import TagsInput from '../../bulma/TagsInput'
import { H1 } from '../../bulma/Text'
import useAppForm from '../../lib/useAppForm'

const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

const FormTestView: React.FC = props => {
  const {
    context,
    handleSubmit,
    canSubmit,
    isLoading,
  } = useAppForm({
    defaultValues: {
      name: '12345',
      xddd: undefined,
      check: false,
      tags: [],
    },
  })

  const onSubmit = async (data: any) => {
    await sleep(1000)

    console.log(data)
  }

  return (
    <Section>
      <Container>
        <H1 kind="title" documentTitle="Trivia Question">Question</H1>

        <Form context={context} onSubmit={handleSubmit(onSubmit)}>
          <Level mobile>
            <Level.Left />
            <Level.Right>
              <Level.Item>
                <Button type="submit" color="primary" disabled={!canSubmit} loading={isLoading}>
                  <Icon i="fas fa-save fa-lg" />
                </Button>
              </Level.Item>
            </Level.Right>
          </Level>

          <Field label="Name">
            <Control>
              <Input name="name" type="text" required minLength={5} />
            </Control>
          </Field>

          <Field label="Number">
            <Control>
              <Icon size="small" i="fas fa-address-card" />
              <Select name="xddd" options={['123', '345', '678']} color="primary" required />
            </Control>
          </Field>

          <Field label="Tags">
            <Control>
              <TagsInput name="tags" pattern="\w+" />
            </Control>
          </Field>

          <Divider text="OR" />

          <Field label="Check">
            <Control>
              <Input name="check" type="checkbox" color="primary" required />
            </Control>
          </Field>
        </Form>
      </Container>
    </Section>
  )
}

export default React.memo(FormTestView)
