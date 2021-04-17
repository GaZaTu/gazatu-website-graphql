import { faCaretDown, faCaretUp, faColumns, faLink, faRedo, faSearch, faUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useMemo } from 'react'
import { BrowserRouter, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import './App.scss'
import AppNavbar from './AppNavbar'
import AppRoutes from './AppRoutes'
import A from './lib/bulma/A'
import Dropdown from './lib/bulma/Dropdown'
import { fileIcons } from './lib/bulma/FileInput'
import Icon from './lib/bulma/Icon'
import Modal from './lib/bulma/Modal'
import Notification, { notificationIcons } from './lib/bulma/Notification'
import { tableIcons } from './lib/bulma/Table'
import Text, { textIcons } from './lib/bulma/Text'
import useFetchGraphQL, { GraphQLContext } from './lib/graphql/useFetchGraphQL'
import useFetch, { FetchContext } from './lib/useFetch'
import { Store } from './store'
import Linkify from 'react-linkify'

notificationIcons.faRedo = faRedo
tableIcons.faSearch = faSearch
tableIcons.faColumns = faColumns
tableIcons.faCaretDown = faCaretDown
tableIcons.faCaretUp = faCaretUp
textIcons.faLink = faLink
fileIcons.faUpload = faUpload

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
    <div className="App" data-name={process.env.REACT_APP_NAME} data-version={process.env.REACT_APP_VERSION}>
      <FetchContext.Provider value={{ fetch }}>
        <GraphQLContext.Provider value={{ fetchGraphQL }}>
          <BrowserRouter>
            <Text.Context.Provider value={{ Linkify }}>
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
            </Text.Context.Provider>
          </BrowserRouter>
        </GraphQLContext.Provider>
      </FetchContext.Provider>
    </div>
  )
}

export default App
