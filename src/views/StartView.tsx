import React from 'react'
import useDocumentAndDrawerTitle from '../lib/useDocumentAndDrawerTitle'
import FeelsDankMan from '../assets/img/FeelsDankMan.png'
import bbFly2x from '../assets/img/bbFly2x.gif'
import { makeStyles, createStyles } from '@material-ui/core/styles'

const useStyles =
  makeStyles(theme =>
    createStyles({
      FeelsDankMan: {
        position: 'fixed',
        bottom: 0,
        left: '-24px',
        [theme.breakpoints.up('sm')]: {
          left: '214px',
        },
      },
      bbFly: {
        position: 'fixed',
        bottom: 0,
        left: '84px',
        [theme.breakpoints.up('sm')]: {
          left: '314px',
        },
      },
      version: {
        color: theme.palette.secondary.main,
        position: 'fixed',
        bottom: 0,
        left: '144px',
        [theme.breakpoints.up('sm')]: {
          left: '374px',
        },
      },
      link: {
        color: theme.palette.secondary.main,
      },
    }),
  )

const StartView: React.FC = () => {
  useDocumentAndDrawerTitle('Start')

  const classes = useStyles()

  return (
    <div>
      <div>
        <p>API-URL for a random set of Trivia Questions: <a href={`${process.env.REACT_APP_API_URL}/trivia/questions`} className={classes.link} target="_blank" rel="noopener noreferrer">{`${process.env.REACT_APP_API_URL}/trivia/questions`}</a></p>
        <p>Query-Parameters:</p>
        <ul>
          <li><b>shuffled</b> (true|false): enables server-side shuffle, default=true</li>
          <li><b>count</b> (number): amount of questions to return (does not affect shuffling)</li>
          <li><b>exclude</b> ([categoryName,...]): list of categories to exclude</li>
          <li><b>include</b> ([categoryName,...]): list of categories to include</li>
          <li><b>submitters</b> ([submitterNames,...]): list of submitters to include</li>
        </ul>
        <p>Example: <a href={`${process.env.REACT_APP_API_URL}/trivia/questions?count=10&exclude=[Anime,Hentai]`} className={classes.link} target="_blank" rel="noopener noreferrer">{`${process.env.REACT_APP_API_URL}/trivia/questions?count=10&exclude=[Anime,Hentai]`}</a></p>
      </div>

      <div>
        <img className={classes.FeelsDankMan} src={FeelsDankMan} alt="FeelsDankMan" />
        <img className={classes.bbFly} src={bbFly2x} alt="bbFly" />
        <div className={classes.version}>v{process.env.REACT_APP_VERSION}</div>
      </div>
    </div>
  )
}

export default StartView
