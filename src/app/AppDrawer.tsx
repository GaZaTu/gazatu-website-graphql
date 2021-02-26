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
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core'

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
          width: `calc(100% - ${drawerWidth}px) !important`,
        },
      },
      menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
          display: 'none !important',
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
  const [store, dispatch] = React.useContext(Store)

  const setPromptDialogClickedButton = (payload: string | null) =>
    dispatch({ type: '@@DRAWER/SET_PROMPT_DIALOG_CLICKED_BUTTON', payload })

  const handleDrawerToggle = () =>
    setMobileOpen(!mobileOpen)

  const drawer = (
    <div>
      <div className={classes.toolbar}>
        <a href={window.location.origin}>
          <img src={logo} alt="brand" />
        </a>
      </div>
      <Divider />
      {sidebar}
    </div>
  )

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" color="inherit" className={classes.appBar}>
        <Toolbar >
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
        <Hidden smDown implementation="css">
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
      <Dialog open={!!store.drawer.promptDialog} onClose={() => setPromptDialogClickedButton(null)} /** disableBackdropClick={store.drawer.promptDialog?.disableBackdropClick} */ >
        {store.drawer.promptDialog?.title && (
          <DialogTitle>{store.drawer.promptDialog?.title}</DialogTitle>
        )}
        {store.drawer.promptDialog?.content && (
          <DialogContent>
            <p>{store.drawer.promptDialog?.content}</p>
          </DialogContent>
        )}
        <DialogActions>
          {store.drawer.promptDialog?.buttons.map(button => (
            <Button key={button.key} type="button" onClick={() => setPromptDialogClickedButton(button.key)}>{button.label}</Button>
          ))}
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default React.memo(AppDrawer)
