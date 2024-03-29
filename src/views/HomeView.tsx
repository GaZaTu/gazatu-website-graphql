import React from 'react'
import bbFly2x from '../assets/img/bbFly2x.gif'
import FeelsDankMan from '../assets/img/FeelsDankMan.png'
import A from '../lib/bulma/A'
import Button from '../lib/bulma/Button'
import Container from '../lib/bulma/Container'
import Content from '../lib/bulma/Content'
import Section from '../lib/bulma/Section'
import { H1, P } from '../lib/bulma/Text'
import { keywordColor, numberColor, stringColor } from '../lib/QueryStringSubtitle'
import './HomeView.scss'

const HomeView: React.FC = props => {
  return (
    <Section>
      <Container>
        <H1 kind="title">@DANKERS FDM</H1>

        <Content>
          <Button.Group>
            <Button as="a" href="/trivia/questions/new" color="link">Submit Trivia Question</Button>
            <Button as="a" href="/trivia/categories/new" color="link">Submit Trivia Category</Button>
          </Button.Group>

          <P>API-URL for a random set of Trivia Questions: <A href={`${process.env.REACT_APP_API_URL}/trivia/questions`} external /></P>
          <P>Query-Parameters:</P>
          <ul>
            <li><b>shuffled</b> (<i style={{ color: keywordColor }}>true</i>|<i style={{ color: keywordColor }}>false</i>): enables server-side shuffle, <i>default=<span style={{ color: keywordColor }}>true</span></i></li>
            <li><b>count</b> (<i style={{ color: numberColor }}>number</i>): amount of questions to return (does not affect shuffling)</li>
            <li><b>exclude</b> (<i>[<span style={{ color: stringColor }}>categoryName</span>,...]</i>): list of categories to exclude</li>
            <li><b>include</b> (<i>[<span style={{ color: stringColor }}>categoryName</span>,...]</i>): list of categories to include</li>
            <li><b>submitters</b> (<i>[<span style={{ color: stringColor }}>submitterName</span>,...]</i>): list of submitters to include</li>
          </ul>
          <P>Example: <A href={`${process.env.REACT_APP_API_URL}/trivia/questions?count=10&exclude=[Anime,Hentai]`} external /></P>
        </Content>

        <div className="home-fdm-bbfly-version">
          <img className="home-fdm" src={FeelsDankMan} alt="FeelsDankMan" />
          <img className="home-bbfy" src={bbFly2x} alt="bbFly" />
          <span className="home-version">v{process.env.REACT_APP_VERSION}</span>
        </div>
      </Container>
    </Section>
  )
}

export default React.memo(HomeView)
