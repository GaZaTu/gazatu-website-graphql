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

const TriviaQuestionListView = React.lazy(() => import('./views/trivia/TriviaQuestionListView'))
const TriviaQuestionView = React.lazy(() => import('./views/trivia/TriviaQuestionView'))
const TriviaCategoryListView = React.lazy(() => import('./views/trivia/TriviaCategoryListView'))
const TriviaCategoryView = React.lazy(() => import('./views/trivia/TriviaCategoryView'))

const BlogGalleryView = React.lazy(() => import('./views/blog/BlogGalleryView'))

const AppRoutes: React.FC = props => {
  const isAuthenticated = useAuthorization()
  const isAdmin = useAuthorization('admin')
  const isTriviaAdmin = useAuthorization('trivia-admin')
  const { pushError } = useContext(Notification.Portal)

  return (
    <ErrorBoundary onError={e => pushError(e)}>
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

          <Route path="/meta/graphiql" exact>
            <GraphiQLView />
          </Route>
          {isAuthenticated && (
            <Route path="/meta/event-log" exact>
              <EventLogView />
            </Route>
          )}

          <Route path="/trivia/questions" exact>
            <TriviaQuestionListView />
          </Route>
          <Route path="/trivia/questions/:id" exact>
            <TriviaQuestionView />
          </Route>
          <Route path="/trivia/categories" exact>
            <TriviaCategoryListView />
          </Route>
          <Route path="/trivia/categories/:id" exact>
            <TriviaCategoryView />
          </Route>

          <Route path="/blog/gallery" exact>
            <BlogGalleryView />
          </Route>

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
