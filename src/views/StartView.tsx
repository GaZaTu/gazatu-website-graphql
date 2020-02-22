import React from 'react'
import useDocumentAndDrawerTitle from '../lib/useDocumentAndDrawerTitle'

const StartView: React.FC = () => {
  useDocumentAndDrawerTitle('Start')

  return (
    <div>
      <p>API-URL for a random set of Trivia Questions: <a href={`${process.env.REACT_APP_API_URL}/trivia/questions`} target="_blank" rel="noopener noreferrer">{`${process.env.REACT_APP_API_URL}/trivia/questions`}</a></p>
      <p>Query-Parameters:</p>
      <ul>
        <li><b>shuffled</b> (true|false): enables server-side shuffle, default=true</li>
        <li><b>count</b> (number): amount of questions to return (does not affect shuffling)</li>
        <li><b>exclude</b> ([categoryName,...]): list of categories to exclude</li>
        <li><b>include</b> ([categoryName,...]): list of categories to include</li>
        <li><b>submitters</b> ([submitterNames,...]): list of submitters to include</li>
      </ul>
      <p>Example: <a href={`${process.env.REACT_APP_API_URL}/trivia/questions?count=10&exclude=[Anime,Hentai]`} target="_blank" rel="noopener noreferrer">{`${process.env.REACT_APP_API_URL}/trivia/questions?count=10&exclude=[Anime,Hentai]`}</a></p>
    </div>
  )
}

export default StartView
