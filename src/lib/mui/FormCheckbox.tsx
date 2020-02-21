import React from 'react'
import Form from '../Form'
import Checkbox from '@material-ui/core/Checkbox'

type FormCheckboxProps = React.ComponentProps<typeof Checkbox> & {
  name: string
}

const FormCheckbox: React.FC<FormCheckboxProps> = props => {
  const { name, children, ...nativeProps } = props
  const { checkboxProps } = React.useContext(Form.Context)
  const checkboxPropsObject = checkboxProps(name)

  return (
    <Checkbox {...nativeProps} {...checkboxPropsObject as any}>
      {children}
    </Checkbox>
  )
}

export default React.memo(FormCheckbox)
