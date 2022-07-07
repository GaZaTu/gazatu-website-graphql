import React, { useMemo, useState } from 'react'
import Button from '../../lib/bulma/Button'
import Column from '../../lib/bulma/Column'
import Container from '../../lib/bulma/Container'
import Content from '../../lib/bulma/Content'
import Control from '../../lib/bulma/Control'
import Divider from '../../lib/bulma/Divider'
import Field from '../../lib/bulma/Field'
import Section from '../../lib/bulma/Section'
import { H1 } from '../../lib/bulma/Text'
import TextArea from '../../lib/bulma/TextArea'
import { decodeForsenCode, encodeForsenCode } from './forsencode'

const ForsenCodeView: React.FC = props => {
  const [decoded, setDecoded] = useState('')
  const [encoded, setEncoded] = useState('')

  const encode = useMemo(() => {
    return () => {
      setEncoded(encodeForsenCode(decoded))
    }
  }, [decoded])

  const decode = useMemo(() => {
    return () => {
      setDecoded(decodeForsenCode(encoded))
    }
  }, [encoded])

  return (
    <Section>
      <Container>
        <H1 kind="title">ForsenCode 6-bit</H1>

        <Content>
          <Column.Row>
            <Column>
              <Field label="text">
                <Control>
                  <TextArea value={decoded} onValueChange={setDecoded} />
                </Control>
              </Field>
            </Column>

            <Divider vertical />

            <Column>
              <Field label="code">
                <Control>
                  <TextArea value={encoded} onValueChange={setEncoded} />
                </Control>
              </Field>
            </Column>
          </Column.Row>

          <Button.Group>
            <Button type="button" onClick={encode}>Encode</Button>
            <Button type="button" onClick={decode}>Decode</Button>
          </Button.Group>
        </Content>
      </Container>
    </Section>
  )
}

export default React.memo(ForsenCodeView)
