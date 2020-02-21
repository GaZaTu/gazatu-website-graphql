import React, { useContext, useMemo, useEffect, useState } from 'react'
import { List, ListItem, ListItemIcon, ListItemText, Divider, ListSubheader, Badge } from '@material-ui/core'
import HomeIcon from '@material-ui/icons/Home'
import NavLink from '../lib/mui/NavLink'
import useAuthorization from '../lib/useAuthorization'
import { graphql } from '../lib/graphql'
import useQuery from '../lib/graphql/useQuery'
import { Query, TriviaCounts } from '../lib/graphql/schema.gql'
import { Store } from '../store'
import { useInterceptor } from '../lib/hookrouter'

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
          }
        }
      `
    } else {
      return undefined
    }
  }, [isTriviaAdmin, trivia.invalidateCounts])

  const [triviaCountsResult,,, reloadTriviaCounts] = useQuery<Query>({
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
      <List dense>
        <NavLink href="/" color="inherit" underline="none">
          <ListItem button>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Start" />
          </ListItem>
        </NavLink>
      </List>

      <Divider />

      <List dense subheader={(
        <ListSubheader>Trivia</ListSubheader>
      )}>
        <NavLink href="/trivia/questions/new" color="inherit" underline="none">
          <ListItem button>
            <ListItemText primary="Submit Question" />
          </ListItem>
        </NavLink>
        <NavLink href="/trivia/questions" replaceQueryParams force color="inherit" underline="none">
          <ListItem button>
            <ListItemText primary="Questions" />
          </ListItem>
        </NavLink>
        <NavLink href="/trivia/categories/new" color="inherit" underline="none">
          <ListItem button>
            <ListItemText primary="Submit Category" />
          </ListItem>
        </NavLink>
        <NavLink href="/trivia/categories" color="inherit" underline="none">
          <ListItem button>
            <ListItemText primary="Categories" />
          </ListItem>
        </NavLink>

        {isTriviaAdmin && (
          <React.Fragment>
            <NavLink href="/trivia/reports" color="inherit" underline="none">
              <ListItem button>
                <Badge badgeContent={triviaCountsResult?.triviaCounts?.reportsCount} color="primary" invisible={triviaCountsResult?.triviaCounts?.reportsCount === undefined}>
                  <ListItemText primary="Reports" />
                </Badge>
              </ListItem>
            </NavLink>
            <NavLink href="/trivia/questions" queryParams={{ reported: true }} replaceQueryParams force color="inherit" underline="none">
              <ListItem button>
                <Badge badgeContent={triviaCountsResult?.triviaCounts?.reportedQuestionsCount} color="primary" invisible={triviaCountsResult?.triviaCounts?.reportedQuestionsCount === undefined}>
                  <ListItemText primary="Reported Questions" />
                </Badge>
              </ListItem>
            </NavLink>
            <NavLink href="/trivia/questions" queryParams={{ verified: false }} replaceQueryParams force color="inherit" underline="none">
              <ListItem button>
                <Badge badgeContent={triviaCountsResult?.triviaCounts?.unverifiedQuestionsCount} color="primary" invisible={triviaCountsResult?.triviaCounts?.unverifiedQuestionsCount === undefined}>
                  <ListItemText primary="Unverified Questions" />
                </Badge>
              </ListItem>
            </NavLink>
            <NavLink href="/trivia/categories" queryParams={{ verified: false }} replaceQueryParams force color="inherit" underline="none">
              <ListItem button>
                <Badge badgeContent={triviaCountsResult?.triviaCounts?.unverifiedCategoriesCount} color="primary" invisible={triviaCountsResult?.triviaCounts?.unverifiedCategoriesCount === undefined}>
                  <ListItemText primary="Unverified Categories" />
                </Badge>
              </ListItem>
            </NavLink>
          </React.Fragment>
        )}
      </List>

      {isAdmin && (
        <List dense subheader={(
          <ListSubheader>Users</ListSubheader>
        )}>
          <NavLink href="/users" color="inherit" underline="none">
            <ListItem button>
              <ListItemText primary="Users" />
            </ListItem>
          </NavLink>
        </List>
      )}

      <List dense subheader={(
        <ListSubheader>Meta</ListSubheader>
      )}>
        <NavLink href="/meta/graphiql" color="inherit" underline="none">
          <ListItem button>
            <ListItemText primary="GraphiQL" />
          </ListItem>
        </NavLink>
      </List>
    </React.Fragment>
  )
}

export default React.memo(AppSidebar)
