import React from 'react'
import Form from '../Form'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'

type FormControlWrapperProps = React.ComponentProps<typeof FormControl> & {
  name: string
}

const FormControlWrapper: React.FC<FormControlWrapperProps> = props => {
  const { name, children, ...nativeProps } = props
  const { errors } = React.useContext(Form.Context)
  const error = errors[name]

  return (
    <FormControl {...nativeProps} error={!!error}>
      {children}
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  )
}

export default React.memo(FormControlWrapper)
