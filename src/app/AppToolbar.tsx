import React from 'react'
import { Button, IconButton, Menu, MenuItem, Link, TextField } from '@material-ui/core'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import { Store } from '../store'
import useAuthorization from '../lib/useAuthorization'
import NavLink from '../lib/mui/NavLink'

const AppToolbar: React.FC = () => {
  const [{ theme: themeOverrides }, dispatch] = React.useContext(Store)
  const [isAuthenticated, auth] = useAuthorization()
  const [profileMenuEl, setProfileMenuEl] = React.useState<null | Element>(null)

  const handleProfileMenuOpen = (ev: React.MouseEvent) =>
    setProfileMenuEl(ev.currentTarget)

  const handleProfileMenuClose = () =>
    setProfileMenuEl(null)

  const logout = () =>
    dispatch({ type: '@@AUTH/LOGOUT' })

  const themeMode = themeOverrides.palette?.mode ?? 'system'

  const changeThemeMode = (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    dispatch({ type: '@@THEME/SET_STATE', payload: { palette: { mode: ev.target.value === 'system' ? undefined : ev.target.value as any } } })

  return (
    <React.Fragment>
      <Link href="https://github.com/GaZaTu/gazatu-website-graphql" target="_blank" rel="noopener noreferrer" color="secondary" underline="none">
        <Button color="inherit">GitHub</Button>
      </Link>

      <IconButton color="inherit" onClick={handleProfileMenuOpen}>
        <AccountCircleIcon />
      </IconButton>

      <Menu
        anchorEl={profileMenuEl}
        keepMounted
        open={Boolean(profileMenuEl)}
        onClose={handleProfileMenuClose}
      >
        {isAuthenticated && auth && (
          <NavLink href={`/users/${auth.user.id}`} color="inherit" underline="none">
            <MenuItem>Profile</MenuItem>
          </NavLink>
        )}
        {isAuthenticated && (
          <MenuItem onClick={logout}>Logout</MenuItem>
        )}
        {!isAuthenticated && (
          <NavLink href="/login" color="inherit" underline="none">
            <MenuItem>Login</MenuItem>
          </NavLink>
        )}
        <MenuItem button={false}>
          <TextField label="Theme" variant="standard" style={{ minWidth: '10rem' }} value={themeMode} onChange={changeThemeMode} select>
            <MenuItem value="system">System Default</MenuItem>
            <MenuItem value="light">Light-Mode</MenuItem>
            <MenuItem value="dark">Dark-Mode</MenuItem>
          </TextField>
        </MenuItem>
      </Menu>
    </React.Fragment>
  )
}

export default React.memo(AppToolbar)
