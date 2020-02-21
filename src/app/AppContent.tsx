import React from 'react'
import { useRoutes } from '../lib/hookrouter'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import NotFoundView from '../views/NotFoundView'
import useAuthorization from '../lib/useAuthorization'

const StartView = React.lazy(() => import('../views/StartView'))
const GraphiQLView = React.lazy(() => import('../views/meta/GraphiQLView'))
const LoginView = React.lazy(() => import('../views/LoginView'))
const UserListView = React.lazy(() => import('../views/users/UserListView'))
const UserView = React.lazy(() => import('../views/users/UserView'))
const TriviaQuestionListView = React.lazy(() => import('../views/trivia/TriviaQuestionListView'))
const TriviaQuestionView = React.lazy(() => import('../views/trivia/TriviaQuestionView'))
const TriviaCategoryListView = React.lazy(() => import('../views/trivia/TriviaCategoryListView'))
const TriviaCategoryView = React.lazy(() => import('../views/trivia/TriviaCategoryView'))
const TriviaReportListView = React.lazy(() => import('../views/trivia/TriviaReportListView'))

const useStyles =
  makeStyles(theme =>
    createStyles({
      progress: {
        margin: theme.spacing(2),
      },
    }),
  )

const AppContent: React.FC = () => {
  const classes = useStyles()
  const [isAuthenticated] = useAuthorization()
  const [isAdmin] = useAuthorization('admin')
  const [isTriviaAdmin] = useAuthorization('trivia-admin')

  const publicRoutes = React.useMemo(() => {
    return {
      '/': () => <StartView />,
      '/meta/graphiql': () => <GraphiQLView />,
      '/login': () => <LoginView />,
      '/trivia/questions': () => <TriviaQuestionListView />,
      '/trivia/questions/:id': ({ id }: any) => <TriviaQuestionView id={id} />,
      '/trivia/categories': () => <TriviaCategoryListView />,
      '/trivia/categories/:id': ({ id }: any) => <TriviaCategoryView id={id} />,
    }
  }, [])

  const authenticatedRoutes = React.useMemo(() => {
    return isAuthenticated && {
      '/users/:id': ({ id }: any) => <UserView id={id} />,
    }
  }, [isAuthenticated])

  const adminRoleRoutes = React.useMemo(() => {
    return isAdmin && {
      '/users': () => <UserListView />,
      '/meta/languages': () => { },
      '/meta/languages/:id': ({ id }: any) => { },
    }
  }, [isAdmin])

  const triviaAdminRoleRoutes = React.useMemo(() => {
    return isTriviaAdmin && {
      '/trivia/reports': () => <TriviaReportListView />,
    }
  }, [isTriviaAdmin])

  const routeMatch = useRoutes({
    ...publicRoutes,
    ...authenticatedRoutes,
    ...adminRoleRoutes,
    ...triviaAdminRoleRoutes,
  })

  return (
    <React.Suspense fallback={<CircularProgress className={classes.progress} />}>
      {routeMatch || <NotFoundView /> }
    </React.Suspense>
  )
}

export default React.memo(AppContent)
