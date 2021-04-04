import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Pageloader from './bulma/Pageloader'
import { Span } from './bulma/Text'
import useAuthorization from './store/useAuthorization'

const HomeView = React.lazy(() => import('./views/HomeView'))
const LoginView = React.lazy(() => import('./views/LoginView'))

const AppRoutes: React.FC = props => {
  const [isAuthenticated] = useAuthorization()
  const [isAdmin] = useAuthorization('admin')
  const [isTriviaAdmin] = useAuthorization('trivia-admin')

  return (
    <Pageloader.Suspense title="Loading...">
      <Switch>
        <Route path="/" exact>
          <HomeView />
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
  )
}

export default React.memo(AppRoutes)
