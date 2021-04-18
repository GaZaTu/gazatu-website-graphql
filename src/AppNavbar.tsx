import { faDesktop, faMoon, faSun, faUserCircle } from '@fortawesome/free-solid-svg-icons'
import React, { useContext, useEffect, useLayoutEffect } from 'react'
import { useMediaQuery } from 'react-responsive'
import logoPng from './assets/img/gazatu-xyz.png'
import { Query } from './assets/schema.gql'
import Button from './lib/bulma/Button'
import Control from './lib/bulma/Control'
import Dropdown from './lib/bulma/Dropdown'
import Field from './lib/bulma/Field'
import Icon from './lib/bulma/Icon'
import Navbar from './lib/bulma/Navbar'
import Notification from './lib/bulma/Notification'
import Select from './lib/bulma/Select'
import Tag from './lib/bulma/Tag'
import { Span } from './lib/bulma/Text'
import { graphql } from './lib/graphql'
import { GraphQLContext } from './lib/graphql/useFetchGraphQL'
import useQuery from './lib/graphql/useQuery'
import useAction from './lib/store/useAction'
import useStoredState from './lib/useStoredState'
import { Store } from './store'
import useAuthorization from './store/useAuthorization'

const triviaCountsQuery = graphql`
  query Query {
    triviaCounts {
      unverifiedQuestionsCount
      unverifiedCategoriesCount
      reportsCount
      reportedQuestionsCount
      danglingQuestionsCount
    }
  }
`

const AppNavbar: React.FC<{}> = props => {
  const [, dispatch] = useContext(Store)
  const isAuthenticated = useAuthorization()
  const isAdmin = useAuthorization('admin')
  const isTriviaAdmin = useAuthorization('trivia-admin')

  const [theme, setTheme] = useStoredState('@@COLOR_SCHEME', 'Dark-Mode')
  const prefersDark = useMediaQuery({ query: '(prefers-color-scheme: dark)' })
  useLayoutEffect(() => {
    const classToken = theme.startsWith('Light') ? 'light-theme' : (theme.startsWith('Dark') ? 'dark-theme' : (prefersDark ? 'dark-theme' : 'light-theme'))

    document.documentElement.classList.add(classToken)

    return () => {
      document.documentElement.classList.remove(classToken)
    }
  }, [theme, prefersDark])

  const logout = useAction(dispatch, '@@AUTH/LOGOUT')

  const [triviaCountsResult, triviaCountsError, triviaCountsLoading, reloadTriviaCounts] = useQuery<Query>({
    query: triviaCountsQuery,
    disabled: !isTriviaAdmin,
  })
  const triviaCounts = triviaCountsResult?.triviaCounts

  const { useErrorNotificationEffect } = useContext(Notification.Portal)
  useErrorNotificationEffect(triviaCountsError, reloadTriviaCounts)

  const { mutationCount } = useContext(GraphQLContext)
  useEffect(() => {
    if (triviaCountsLoading) {
      return
    }

    // reloadTriviaCounts()
  }, [reloadTriviaCounts, triviaCountsLoading, mutationCount])

  return (
    <Navbar fixed="top" shadow padded>
      <Navbar.Brand addBurger>
        <Navbar.Item href="/" active={false}>
          <img src={logoPng} alt="logo" />
        </Navbar.Item>
      </Navbar.Brand>

      <Navbar.Menu>
        <Navbar.Start>
          <Navbar.Item label="About" href="/about" as="div" hoverable>
            <Navbar.Item label="Home" href="/" exact />
            <Navbar.Divider />
            <Navbar.Item label="Contact" href="/about/contact" exact />
            <Navbar.Item label="Report an Issue" href="/about/issues/new" exact />
          </Navbar.Item>

          <Navbar.Item label={(
            <>
              <span>Trivia</span>
              {isTriviaAdmin && (
                <Tag color="primary" round tight={false}>{Object.values(triviaCounts ?? {}).reduce((s, v) => s + v, 0) - (triviaCounts?.questionsCount ?? 0) - (triviaCounts?.categoriesCount ?? 0)}</Tag>
              )}
            </>
          )} href="/trivia" as="div" hoverable>
            <Navbar.Item label="Submit Question" href="/trivia/questions/new" exact />
            <Navbar.Item label="Submit Category" href="/trivia/categories/new" exact />
            <Navbar.Divider />
            <Navbar.Item label="Questions" href="/trivia/questions" exact />
            <Navbar.Item label="Categories" href="/trivia/categories" exact />
            <Navbar.Divider />
            <Navbar.Item label="Report a Question" href="/trivia/reports/new" exact />
            {isTriviaAdmin && (
              <>
                <Navbar.Divider />
                <Navbar.Item label="Categories (Unverified)" href="/trivia/categories?verified=false" exact>
                  <Tag color="primary" round>{triviaCounts?.unverifiedCategoriesCount}</Tag>
                </Navbar.Item>
                <Navbar.Item label="Questions (Unverified)" href="/trivia/questions" params={{ verified: false, dangling: false }} exact exactParams>
                  <Tag color="primary" round>{triviaCounts?.unverifiedQuestionsCount}</Tag>
                </Navbar.Item>
                <Navbar.Item label="Questions (Unverified Categories)" href="/trivia/questions?dangling=true" exact>
                  <Tag color="primary" round>{triviaCounts?.danglingQuestionsCount}</Tag>
                </Navbar.Item>
                <Navbar.Divider />
                <Navbar.Item label="Reports" href="/trivia/reports" exact>
                  <Tag color="primary" round>{triviaCounts?.reportsCount}</Tag>
                </Navbar.Item>
                <Navbar.Item label="Questions (Reported)" href="/trivia/questions?reported=true" exact>
                  <Tag color="primary" round>{triviaCounts?.reportedQuestionsCount}</Tag>
                </Navbar.Item>
              </>
            )}
          </Navbar.Item>

          <Navbar.Item label="Blog" href="/blog" as="div" hoverable>
            <Navbar.Item label="Gallery" href="/blog/gallery" exact />
          </Navbar.Item>

          <Navbar.Item label="Meta" href="/meta" as="div" hoverable>
            <Navbar.Item label="GraphiQL" href="/meta/graphiql" exact />
            {isAdmin && (
              <>
                <Navbar.Divider />
                <Navbar.Item label="Users" href="/meta/users" exact />
                <Navbar.Divider />
                <Navbar.Item label="Event-Log" href="/meta/event-log" exact />
              </>
            )}
          </Navbar.Item>

          {(process.env.NODE_ENV !== 'production') && (
            <Navbar.Item label="Test" href="/test" exact />
          )}
        </Navbar.Start>

        <Navbar.End>
          <Navbar.Item as="div">
            <Button.Group align="right">
              <Button as="a" kind="inverted" color="primary" href="https://github.com/GaZaTu/gazatu-website-graphql" external>
                GITHUB
              </Button>
              <Dropdown hoverable right narrow>
                <Dropdown.Trigger>
                  <Button kind="inverted" color={isAuthenticated ? 'primary' : undefined}>
                    <Icon icon={faUserCircle} />
                  </Button>
                </Dropdown.Trigger>
                <Dropdown.Menu>
                  {isAuthenticated && (
                    <>
                      <Dropdown.Item href="/profile">Profile</Dropdown.Item>
                      <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
                    </>
                  )}
                  {!isAuthenticated && (
                    <>
                      <Dropdown.Item href="/login">Login</Dropdown.Item>
                    </>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item as="div">
                    <Field label="Theme">
                      <Control>
                        <Select
                          value={theme}
                          onChange={setTheme}
                          options={['System Default', 'Light-Mode', 'Dark-Mode']}
                          getLabelElement={l => (
                            <Span>
                              <Icon icon={l.startsWith('Light') ? faSun : (l.startsWith('Dark') ? faMoon : faDesktop)} />
                              {l}
                            </Span>
                          )}
                          required
                        />
                      </Control>
                    </Field>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Button.Group>
          </Navbar.Item>
        </Navbar.End>
      </Navbar.Menu>
    </Navbar>
  )
}

export default React.memo(AppNavbar)
