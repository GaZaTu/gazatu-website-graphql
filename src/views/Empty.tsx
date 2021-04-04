import React from 'react'
import Container from '../bulma/Container'
import Section from '../bulma/Section'

const EmptyView: React.FC = props => {
  return (
    <Section>
      <Container>
      </Container>
    </Section>
  )
}

export default React.memo(EmptyView)
