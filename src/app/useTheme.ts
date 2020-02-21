import { useMemo, useContext } from 'react'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'
import { Store } from '../store'

const useTheme = () => {
  const prefersDarkColorScheme = useMediaQuery('(prefers-color-scheme: dark)')
  const [{ theme: themeOverrides }] = useContext(Store)
  const colorScheme = prefersDarkColorScheme ? 'dark' : 'light'
  const paletteType = themeOverrides.palette?.type ?? colorScheme

  const theme = useMemo(() => {
    return createMuiTheme({
      "palette": {
        type: paletteType,
        background: paletteType === 'dark' ? {
          default: '#212121',
          paper: '#212121',
        } : {},
        primary: {
          main: '#8a2be2',
          light: '#c05fff',
          dark: '#5300af',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#e22bde',
          light: '#ff6aff',
          dark: '#ac00ac',
          contrastText: '#000000',
        },
      },
      overrides: {
        MuiTableRow: {
          root: {
            '&hover': {
              backgroundColor: 'rgba(245, 245, 245, 0.1)',
            },
            '&selected': {
              backgroundColor: 'rgba(74, 20, 140, 0.2)',
            },
          },
        },
      }
    })
  }, [paletteType])

  return theme
}

export default useTheme
