import React, { useContext } from 'react'
import { Route, Switch } from 'react-router-dom'
import Notification from './bulma/Notification'
import Pageloader from './bulma/Pageloader'
import { Span } from './bulma/Text'
import ErrorBoundary from './lib/ErrorBoundary'
import useAuthorization from './store/useAuthorization'

const HomeView = React.lazy(() => import('./views/HomeView'))
const LoginView = React.lazy(() => import('./views/LoginView'))
const GraphiQLView = React.lazy(() => import('./views/meta/GraphiQLView'))
const EventLogView = React.lazy(() => import('./views/meta/EventLogView'))

const AppRoutes: React.FC = props => {
  const [isAuthenticated] = useAuthorization()
  const [isAdmin] = useAuthorization('admin')
  const [isTriviaAdmin] = useAuthorization('trivia-admin')
  const { pushError } = useContext(Notification.Context)

  return (
    <ErrorBoundary onError={e => pushError(e)}>
      <Pageloader.Suspense title="Loading...">
        <Switch>
          <Route path="/" exact>
            <HomeView />
          </Route>

          <Route path="/meta/graphiql" exact>
            <GraphiQLView />
          </Route>

          <Route path="/meta/event-log" exact>
            <EventLogView />
          </Route>

          {!isAuthenticated && (
            <Route path="/login" exact>
              <LoginView />
            </Route>
          )}

          <Route>
            <Pageloader active>
              <Span kind="title">404</Span>
            </Pageloader>
          </Route>
        </Switch>
      </Pageloader.Suspense>
    </ErrorBoundary>
  )
}

export default React.memo(AppRoutes)
