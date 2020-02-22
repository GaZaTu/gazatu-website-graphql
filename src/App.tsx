import React, { useContext } from 'react'
import { SnackbarProvider } from 'notistack'
import { GraphQLContext } from './lib/graphql'
import { createFetchGraphQL } from './lib/createFetchGraphQL'
import { Store } from './store'
import AppThemeProvider from './app/AppThemeProvider'
import AppDrawer from './app/AppDrawer'
import AppSidebar from './app/AppSidebar'
import AppToolbar from './app/AppToolbar'
import AppContent from './app/AppContent'
import './App.css'

const App: React.FC = () => {
  const [store] = useContext(Store)

  const fetchGraphQL = React.useMemo(() => {
    if (store.auth) {
      return createFetchGraphQL({
        headers: {
          'Authorization': `Bearer ${store.auth.token}`,
        },
      })
    } else {
      return createFetchGraphQL()
    }
  }, [store.auth])

  return (
    <div className="App">
      <div className="App-Name">{process.env.REACT_APP_NAME}</div>
      <div className="App-Version">{process.env.REACT_APP_VERSION}</div>
      <AppThemeProvider>
        <GraphQLContext.Provider value={{ fetchGraphQL }}>
          <SnackbarProvider maxSnack={3}>
            <AppDrawer>
              {{
                sidebar: (<AppSidebar />),
                toolbar: (<AppToolbar />),
                content: (<AppContent />),
              }}
            </AppDrawer>
          </SnackbarProvider>
        </GraphQLContext.Provider>
      </AppThemeProvider>
    </div>
  )
}

export default App
