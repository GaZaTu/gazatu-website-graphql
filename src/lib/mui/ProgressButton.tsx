import React from 'react'
import { Button, CircularProgress, makeStyles, createStyles } from '@material-ui/core'
import { green } from '@material-ui/core/colors'

const useStyles =
  makeStyles(theme =>
    createStyles({
      buttonWrapper: {
        // margin: theme.spacing(1),
        position: 'relative',
      },
      buttonProgress: {
        color: green[500],
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
      },
    }),
  )

interface Props extends React.ComponentProps<typeof Button> {
  loading?: boolean
}

const ProgressButton: React.FC<Props> = props => {
  const { loading, children, ...nativeProps } = props
  const classes = useStyles()

  return (
    <div className={classes.buttonWrapper}>
      <Button {...nativeProps} disabled={nativeProps.disabled || loading}>
        {children}
      </Button>

      {loading && (
        <CircularProgress size={24} className={classes.buttonProgress} />
      )}
    </div>
  )
}

export default React.memo(ProgressButton)
