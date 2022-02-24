import { faAngleDown, faAngleUp, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import Card from '../../lib/bulma/Card'
import Container from '../../lib/bulma/Container'
import Content from '../../lib/bulma/Content'
import Icon from '../../lib/bulma/Icon'
import Image from '../../lib/bulma/Image'
import Media from '../../lib/bulma/Media'
import Section from '../../lib/bulma/Section'
import { P } from '../../lib/bulma/Text'
import './TestView.css'

const text = `
test1
test2
test3
test4
test5
test6
test7
`

const TestView: React.FC = props => {
  return (
    <Section>
      <Container>
        {/* <div className="monitor">
          <div className="screen">
            <div className="crt">
              <div className="scanline" />
              <div className="terminal">
                {text.trim().split('\n').map((line, i) => (
                  <div className="terminal-output" key={i}>
                    {line}
                  </div>
                ))}

                <div className="terminal-input" contentEditable />
              </div>
            </div>
          </div>
        </div> */}
        <Card>
          {/* <Card.Header title="Test" Icon={({ collapsed }) => <Icon icon={collapsed ? faAngleDown : faAngleUp} />} /> */}

          {/* <Card.Image src="https://bulma.io/images/placeholders/1280x960.png" ratio={4/3} /> */}

          <Card.Content>
            <Media>
              <Media.Left>
                <Image src="https://bulma.io/images/placeholders/96x96.png" dimension="64x64" />
              </Media.Left>

              <Media.Content>
                <P kind="title">John Smith</P>
                <P kind="subtitle">@johnsmith</P>
              </Media.Content>
            </Media>

            <Content>
              <P>test123 xd xd</P>
            </Content>
          </Card.Content>

          <Card.Footer>
            <Card.Footer.Item>Save</Card.Footer.Item>
            <Card.Footer.Item>Delete</Card.Footer.Item>
          </Card.Footer>
        </Card>
      </Container>
    </Section>
  )
}

export default React.memo(TestView)
