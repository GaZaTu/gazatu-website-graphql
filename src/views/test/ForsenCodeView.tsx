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
import { decodeForsenCode7Bit, encodeForsenCode7Bit } from './forsencode7bit'

const ForsenCodeView: React.FC = props => {
  const [decoded, setDecoded] = useState('')
  const [encoded, setEncoded] = useState('')

  const encode = useMemo(() => {
    return () => {
      setEncoded(encodeForsenCode7Bit(decoded))
    }
  }, [decoded])

  const decode = useMemo(() => {
    return () => {
      setDecoded(decodeForsenCode7Bit(encoded))
    }
  }, [encoded])

  return (
    <Section>
      <Container>
        <H1 kind="title">ForsenCode 7-bit</H1>

        <Content>
          <Column.Row>
            <Column>
              <Field label="text">
                <Control>
                  <TextArea value={decoded} onValueChange={setDecoded} />
                </Control>
              </Field>

              <Button.Group align="right">
                <Button type="button" onClick={encode} style={{ marginRight: 0 }}>Encode</Button>
              </Button.Group>
            </Column>

            <Divider vertical />

            <Column>
              <Field label="code">
                <Control>
                  <TextArea value={encoded} onValueChange={setEncoded} />
                </Control>
              </Field>

              <Button.Group align="left">
                <Button type="button" onClick={decode} style={{ marginLeft: 0 }}>Decode</Button>
              </Button.Group>
            </Column>
          </Column.Row>
        </Content>
      </Container>
    </Section>
  )
}

export default React.memo(ForsenCodeView)
