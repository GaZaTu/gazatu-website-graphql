import { useMemo, useContext } from 'react'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import darkScrollbar from '@material-ui/core/darkScrollbar'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'
import { Store } from '../store'

const useTheme = () => {
  const usesDesktopDisplay = useMediaQuery('(min-width: 600px)')
  const prefersDarkColorScheme = useMediaQuery('(prefers-color-scheme: dark)')
  const [{ theme: themeOverrides }] = useContext(Store)
  const colorScheme = prefersDarkColorScheme ? 'dark' : 'light'
  const paletteMode = themeOverrides.palette?.mode ?? colorScheme

  const theme = useMemo(() => {
    return createMuiTheme({
      palette: {
        mode: paletteMode,
        background: paletteMode === 'dark' ? {
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
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              ...((paletteMode === 'dark' && usesDesktopDisplay) ? darkScrollbar() : {}),
            },
          },
        },
      },
      // overrides: {
      //   MuiTableRow: {
      //     root: {
      //       '&hover': {
      //         backgroundColor: 'rgba(245, 245, 245, 0.1)',
      //       },
      //       '&selected': {
      //         backgroundColor: 'rgba(74, 20, 140, 0.2)',
      //       },
      //     },
      //   },
      //   MuiLink: {
      //     root: {
      //       '&.active': {
      //         '& > *': {
      //           backgroundColor: 'rgba(74, 20, 140, 0.2)',
      //         },
      //       },
      //     },
      //   },
      // }
    })
  }, [paletteMode, usesDesktopDisplay])

  return theme
}

export default useTheme
