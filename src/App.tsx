import { faCaretDown, faCaretUp, faColumns, faRedo, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useMemo } from 'react'
import { BrowserRouter, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import './App.scss'
import AppNavbar from './AppNavbar'
import AppRoutes from './AppRoutes'
import A from './bulma/A'
import Dropdown from './bulma/Dropdown'
import Icon from './bulma/Icon'
import Modal from './bulma/Modal'
import Notification, { notificationIcons } from './bulma/Notification'
import { tableIcons } from './bulma/Table'
import useFetchGraphQL, { GraphQLContext } from './graphql/useFetchGraphQL'
import useFetch, { FetchContext } from './lib/useFetch'
import { Store } from './store'

notificationIcons.faRedo = faRedo
tableIcons.faSearch = faSearch
tableIcons.faColumns = faColumns
tableIcons.faCaretDown = faCaretDown
tableIcons.faCaretUp = faCaretUp

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
            <Icon.Context.Provider value={{ Icon: FontAwesomeIcon }}>
              <A.Context.Provider value={{ useLocation, useHistory, useRouteMatch }}>
                <Dropdown.Portal.Provider>
                  <Modal.Portal.Provider>
                    <Notification.Portal.Provider>
                      <AppNavbar />
                      <AppRoutes />
                    </Notification.Portal.Provider>
                  </Modal.Portal.Provider>
                </Dropdown.Portal.Provider>
              </A.Context.Provider>
            </Icon.Context.Provider>
          </BrowserRouter>
        </GraphQLContext.Provider>
      </FetchContext.Provider>
    </div>
  )
}

export default App
