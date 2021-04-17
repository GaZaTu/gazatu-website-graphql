import React from 'react'
import Container from '../../lib/bulma/Container'
import Section from '../../lib/bulma/Section'
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
        <div className="monitor">
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
        </div>
      </Container>
    </Section>
  )
}

export default React.memo(TestView)
