import React from 'react'
import bbFly2x from '../assets/img/bbFly2x.gif'
import FeelsDankMan from '../assets/img/FeelsDankMan.png'
import A from '../bulma/A'
import Container from '../bulma/Container'
import Content from '../bulma/Content'
import Section from '../bulma/Section'
import { H1, P } from '../bulma/Text'
import './HomeView.scss'

const HomeView: React.FC = props => {
  return (
    <Section>
      <Container>
        <H1 kind="title">FDM</H1>

        <Content>
          <P>API-URL for a random set of Trivia Questions: <A href={`${process.env.REACT_APP_API_URL}/trivia/questions`} external /></P>
          <P>Query-Parameters:</P>
          <ul>
            <li><b>shuffled</b> (<i>true</i>|<i>false</i>): enables server-side shuffle, <i>default=true</i></li>
            <li><b>count</b> (<i>number</i>): amount of questions to return (does not affect shuffling)</li>
            <li><b>exclude</b> (<i>[categoryName,...]</i>): list of categories to exclude</li>
            <li><b>include</b> (<i>[categoryName,...]</i>): list of categories to include</li>
            <li><b>submitters</b> (<i>[submitterNames,...]</i>): list of submitters to include</li>
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
