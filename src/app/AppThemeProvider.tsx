import React from 'react'
import { ThemeProvider as MuiThemeProvider } from '@material-ui/styles'
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react'
import useTheme from './useTheme'

interface Props {
  children?: React.ReactNode
}

const AppThemeProvider: React.FC<Props> = props => {
  const { children } = props
  const theme = useTheme()

  return (
    <MuiThemeProvider theme={theme}>
      <EmotionThemeProvider theme={theme}>
        {children}
      </EmotionThemeProvider>
    </MuiThemeProvider>
  )
}

export default React.memo(AppThemeProvider)
