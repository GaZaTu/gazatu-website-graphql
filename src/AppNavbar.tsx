import React, { useContext, useLayoutEffect } from 'react'
import { useMediaQuery } from 'react-responsive'
import logoPng from './assets/img/gazatu-xyz.png'
import Button from './bulma/Button'
import Control from './bulma/Control'
import Dropdown from './bulma/Dropdown'
import Field from './bulma/Field'
import Icon from './bulma/Icon'
import Navbar from './bulma/Navbar'
import Select from './bulma/Select'
import Tag from './bulma/Tag'
import { Span } from './bulma/Text'
import useAction from './lib/store/useAction'
import useStoredState from './lib/useStoredState'
import { Store } from './store'
import useAuthorization from './store/useAuthorization'

const AppNavbar: React.FC<{}> = props => {
  const [, dispatch] = useContext(Store)
  const [isAuthenticated] = useAuthorization()
  const [isAdmin] = useAuthorization('admin')
  const [isTriviaAdmin] = useAuthorization('trivia-admin')

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
                <Tag color="primary" round>2</Tag>
              )}
            </>
          )} href="/trivia" as="div" hoverable>
            <Navbar.Item label="Submit Question" href="/trivia/questions/new" exact />
            <Navbar.Item label="Submit Category" href="/trivia/categories/new" exact />
            <Navbar.Divider />
            <Navbar.Item label="Questions" href="/trivia/questions" exact exactParams />
            <Navbar.Item label="Categories" href="/trivia/categories" exact />
            <Navbar.Divider />
            <Navbar.Item label="Report a Question" href="/trivia/reports/new" exact />
            {isTriviaAdmin && (
              <>
                <Navbar.Divider />
                <Navbar.Item label="Categories (Unverified)" href="/trivia/categories?verified=false" exact>
                  <Tag color="primary" round>2</Tag>
                </Navbar.Item>
                <Navbar.Item label="Questions (Unverified)" href="/trivia/questions" params={{ verified: false, dangling: false }} exact exactParams>
                  <Tag color="primary" round>0</Tag>
                </Navbar.Item>
                <Navbar.Item label="Questions (Unverified Categories)" href="/trivia/questions?dangling=true" exact>
                  <Tag color="primary" round>0</Tag>
                </Navbar.Item>
                <Navbar.Divider />
                <Navbar.Item label="Reports" href="/trivia/reports" exact>
                  <Tag color="primary" round>0</Tag>
                </Navbar.Item>
                <Navbar.Item label="Questions (Reported)" href="/trivia/questions?reported=true" exact>
                  <Tag color="primary" round>0</Tag>
                </Navbar.Item>
              </>
            )}
          </Navbar.Item>

          <Navbar.Item label="Blog" href="/blog" as="div" hoverable>
            <Navbar.Item label="Gallery" href="/blog/gallery" exact />
            {isAdmin && (
              <>
                <Navbar.Divider />
                <Navbar.Item label="New Story" href="/blog/stories/new" exact />
              </>
            )}
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
        </Navbar.Start>

        <Navbar.End>
          <Navbar.Item as="div">
            <Button.Group align="right">
              <Button as="a" kind="inverted" color="primary" href="https://github.com/GaZaTu/gazatu-website-graphql" external>
                GITHUB
              </Button>
              <Dropdown hoverable right narrow>
                <Dropdown.Trigger>
                  <Button as="a" href="/profile" kind="inverted" color={isAuthenticated ? 'primary' : undefined}>
                    <Icon i="fas fa-user-circle fa-lg" />
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
                              <Icon i={`fas fa-${l.startsWith('Light') ? 'sun' : (l.startsWith('Dark') ? 'moon' : 'desktop')}`} />
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
