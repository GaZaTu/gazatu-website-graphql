import React from 'react'
import Form from '../Form'
import Switch from '@material-ui/core/Switch'

type FormSwitchProps = React.ComponentProps<typeof Switch> & {
  name: string
}

const FormSwitch: React.FC<FormSwitchProps> = props => {
  const { name, children, ...nativeProps } = props
  const { checkboxProps } = React.useContext(Form.Context)
  const checkboxPropsObject = checkboxProps(name)

  return (
    <Switch {...nativeProps} {...checkboxPropsObject as any}>
      {children}
    </Switch>
  )
}

export default React.memo(FormSwitch)
