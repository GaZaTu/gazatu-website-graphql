import React, { useContext, useMemo } from 'react'
import { BrowserRouter, useHistory, useRouteMatch } from 'react-router-dom'
import './App.scss'
import AppNavbar from './AppNavbar'
import AppRoutes from './AppRoutes'
import A from './bulma/A'
import Modal from './bulma/Modal'
import Notification from './bulma/Notification'
import useFetchGraphQL, { GraphQLContext } from './graphql/useFetchGraphQL'
import useFetch, { FetchContext } from './lib/useFetch'
import { Store } from './store'

const App: React.FC = props => {
  const [store] = useContext(Store)

  const fetchInit = useMemo<RequestInit>(() => {
    return {
      headers: {
        'Authorization': (store.auth?.token && `Bearer ${store.auth?.token}`) as any,
      },
    }
  }, [store.auth?.token])

  const fetch = useFetch(fetchInit)
  const fetchGraphQL = useFetchGraphQL(fetchInit)

  return (
    <div className="App">
      <div className="App-Name">{process.env.REACT_APP_NAME}</div>
      <div className="App-Version">{process.env.REACT_APP_VERSION}</div>

      <FetchContext.Provider value={{ fetch }}>
        <GraphQLContext.Provider value={{ fetchGraphQL }}>
          <BrowserRouter>
            <A.Context.Provider value={{ useHistory, useRouteMatch }}>
              <Modal.Context.Provider>
                <Notification.Context.Provider>
                  <AppNavbar />
                  <AppRoutes />
                </Notification.Context.Provider>
              </Modal.Context.Provider>
            </A.Context.Provider>
          </BrowserRouter>
        </GraphQLContext.Provider>
      </FetchContext.Provider>
    </div>
  )
}

export default App
