import React from 'react'
import ThemeProvider from '@material-ui/styles/ThemeProvider'
import useTheme from './useTheme'

interface Props {
  children?: React.ReactNode
}

const AppThemeProvider: React.FC<Props> = props => {
  const { children } = props
  const theme = useTheme()

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  )
}

export default React.memo(AppThemeProvider)
