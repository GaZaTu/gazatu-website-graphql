import { Badge, List, ListItem, ListItemText, ListSubheader } from '@material-ui/core'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { graphql } from '../lib/graphql'
import { Query, TriviaCounts } from '../lib/graphql/schema.gql'
import useQuery from '../lib/graphql/useQuery'
import { getPath, useInterceptor } from '../lib/hookrouter'
import NavLink from '../lib/mui/NavLink'
import useAuthorization from '../lib/useAuthorization'
import { Store } from '../store'

export let dispatchReloadTriviaCounts: () => void

const ignore = (_: any) => _

let sidebarIdCounter = 1

const AppSidebar: React.FC = () => {
  const [isAdmin] = useAuthorization('admin')
  const [isTriviaAdmin] = useAuthorization('trivia-admin')
  const [{ trivia }, dispatch] = useContext(Store)

  const triviaCountsQuery = useMemo(() => {
    ignore(trivia.invalidateCounts)

    if (isTriviaAdmin) {
      return graphql`
        query Query {
          triviaCounts {
            questionsCount
            unverifiedQuestionsCount
            categoriesCount
            unverifiedCategoriesCount
            reportsCount
            reportedQuestionsCount
            danglingQuestionsCount
          }
        }
      `
    } else {
      return undefined
    }
  }, [isTriviaAdmin, trivia.invalidateCounts])

  const [triviaCountsResult, , , reloadTriviaCounts] = useQuery<Query>({
    query: triviaCountsQuery,
  })

  useEffect(() => {
    const setTriviaCounts = (counts: TriviaCounts | undefined) =>
      dispatch({ type: '@@TRIVIA/SET_STATE', payload: { counts } })

    setTriviaCounts(triviaCountsResult?.triviaCounts)
  }, [dispatch, triviaCountsResult])

  const [sidebarId] = useState(() => sidebarIdCounter++) // TODO: remove this, some bug with double instantiation

  if (!dispatchReloadTriviaCounts) {
    dispatchReloadTriviaCounts = reloadTriviaCounts
  }

  useInterceptor((previousRoute, nextRoute) => {
    if (sidebarId === 1) {
      reloadTriviaCounts()
    }

    return nextRoute
  })

  return (
    <React.Fragment>
      <List dense subheader={(
        <ListSubheader>Trivia</ListSubheader>
      )}>
        <NavLink exact href="/trivia/questions/new" replaceQueryParams force color="inherit" underline="none">
          <ListItem button>
            <ListItemText primary="Submit Question" />
          </ListItem>
        </NavLink>
        <NavLink exact href="/trivia/questions" replaceQueryParams force color="inherit" underline="none">
          <ListItem button>
            <ListItemText primary="Questions" />
          </ListItem>
        </NavLink>
        <NavLink exact href="/trivia/categories/new" replaceQueryParams force color="inherit" underline="none">
          <ListItem button>
            <ListItemText primary="Submit Category" />
          </ListItem>
        </NavLink>
        <NavLink exact href="/trivia/categories" replaceQueryParams force color="inherit" underline="none">
          <ListItem button>
            <ListItemText primary="Categories" />
          </ListItem>
        </NavLink>

        {isTriviaAdmin && (
          <React.Fragment>
            <NavLink exact href="/trivia/reports" replaceQueryParams force color="inherit" underline="none">
              <ListItem button>
                <Badge badgeContent={triviaCountsResult?.triviaCounts?.reportsCount} color="primary" invisible={triviaCountsResult?.triviaCounts?.reportsCount === undefined}>
                  <ListItemText primary="Reports" />
                </Badge>
              </ListItem>
            </NavLink>
            <NavLink exact href="/trivia/questions" queryParams={{ reported: true }} replaceQueryParams force color="inherit" underline="none">
              <ListItem button>
                <Badge badgeContent={triviaCountsResult?.triviaCounts?.reportedQuestionsCount} color="primary" invisible={triviaCountsResult?.triviaCounts?.reportedQuestionsCount === undefined}>
                  <ListItemText primary="Reported Questions" />
                </Badge>
              </ListItem>
            </NavLink>
            <NavLink exact href="/trivia/questions" queryParams={{ dangling: true }} replaceQueryParams force color="inherit" underline="none">
              <ListItem button>
                <Badge badgeContent={triviaCountsResult?.triviaCounts?.danglingQuestionsCount} color="primary" invisible={triviaCountsResult?.triviaCounts?.danglingQuestionsCount === undefined}>
                  <ListItemText primary="Dangling Questions" />
                </Badge>
              </ListItem>
            </NavLink>
            <NavLink exact href="/trivia/questions" queryParams={{ verified: false, dangling: false }} replaceQueryParams force color="inherit" underline="none">
              <ListItem button>
                <Badge badgeContent={triviaCountsResult?.triviaCounts?.unverifiedQuestionsCount} color="primary" invisible={triviaCountsResult?.triviaCounts?.unverifiedQuestionsCount === undefined}>
                  <ListItemText primary="Unverified Questions" />
                </Badge>
              </ListItem>
            </NavLink>
            <NavLink exact href="/trivia/categories" queryParams={{ verified: false }} replaceQueryParams force color="inherit" underline="none">
              <ListItem button>
                <Badge badgeContent={triviaCountsResult?.triviaCounts?.unverifiedCategoriesCount} color="primary" invisible={triviaCountsResult?.triviaCounts?.unverifiedCategoriesCount === undefined}>
                  <ListItemText primary="Unverified Categories" />
                </Badge>
              </ListItem>
            </NavLink>
          </React.Fragment>
        )}
      </List>

      {(isAdmin || getPath().startsWith('/blog')) && (
        <List dense subheader={(
          <ListSubheader>Blog</ListSubheader>
        )}>
          <NavLink exact href="/blog/gallery" replaceQueryParams force color="inherit" underline="none">
            <ListItem button>
              <ListItemText primary="Gallery" />
            </ListItem>
          </NavLink>
          <NavLink exact href="/blog/stories/new" replaceQueryParams force color="inherit" underline="none">
            <ListItem button>
              <ListItemText primary="New Story" />
            </ListItem>
          </NavLink>
        </List>
      )}

      {isAdmin && (
        <List dense subheader={(
          <ListSubheader>Users</ListSubheader>
        )}>
          <NavLink exact href="/users" replaceQueryParams force color="inherit" underline="none">
            <ListItem button>
              <ListItemText primary="Users" />
            </ListItem>
          </NavLink>
        </List>
      )}

      <List dense subheader={(
        <ListSubheader>Meta</ListSubheader>
      )}>
        <NavLink exact href="/meta/graphiql" replaceQueryParams force color="inherit" underline="none">
          <ListItem button>
            <ListItemText primary="GraphiQL" />
          </ListItem>
        </NavLink>
        {isAdmin && (
          <NavLink exact href="/meta/event-log" replaceQueryParams force color="inherit" underline="none">
            <ListItem button>
              <ListItemText primary="Event-Log" />
            </ListItem>
          </NavLink>
        )}
      </List>

      {/* <List dense subheader={(
        <ListSubheader>Misc</ListSubheader>
      )}>
      </List> */}
    </React.Fragment>
  )
}

export default React.memo(AppSidebar)
