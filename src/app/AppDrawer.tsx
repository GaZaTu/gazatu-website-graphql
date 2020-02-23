import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import CssBaseline from '@material-ui/core/CssBaseline'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import Hidden from '@material-ui/core/Hidden'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import { makeStyles, useTheme, createStyles } from '@material-ui/core/styles'
import { Store } from '../store'
import logo from '../assets/img/gazatu-xyz-drawer.png'

const drawerWidth = 240

const useStyles =
  makeStyles(theme =>
    createStyles({
      root: {
        display: 'flex',
      },
      drawer: {
        [theme.breakpoints.up('sm')]: {
          width: drawerWidth,
          flexShrink: 0,
        },
      },
      appBar: {
        marginLeft: drawerWidth,
        [theme.breakpoints.up('sm')]: {
          width: `calc(100% - ${drawerWidth}px)`,
        },
      },
      menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
          display: 'none',
        },
      },
      toolbar: theme.mixins.toolbar,
      drawerPaper: {
        width: drawerWidth,
      },
      content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        maxWidth: '100vw',
        [theme.breakpoints.up('sm')]: {
          width: `calc(100% - ${drawerWidth}px)`,
        },
      },
      title: {
        flexGrow: 1,
      },
    }),
  )

interface AppDrawerProps {
  children: {
    sidebar?: React.ReactNode
    toolbar?: React.ReactNode
    content?: React.ReactNode
  }
}

const AppDrawer: React.FC<AppDrawerProps> = props => {
  const { children } = props
  const { sidebar, toolbar, content } = children
  const classes = useStyles()
  const theme = useTheme()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [store] = React.useContext(Store)

  const handleDrawerToggle = () =>
    setMobileOpen(!mobileOpen)

  const drawer = (
    <div>
      <div className={classes.toolbar}>
        <img src={logo} alt="brand" />
      </div>
      <Divider />
      {sidebar}
    </div>
  )

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" color="inherit" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title} noWrap>
            {store.drawer.title}
          </Typography>
          {toolbar}
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer}>
        <Hidden smUp implementation="css">
          <Drawer
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true,
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <main className={classes.content} style={{ padding: store.drawer.usePadding ? undefined : 0 }}>
        <div className={classes.toolbar} />
        {content}
      </main>
    </div>
  )
}

export default React.memo(AppDrawer)
