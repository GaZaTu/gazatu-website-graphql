import React from 'react'
import Form from '../Form'
import TextField from '@material-ui/core/TextField'

type FormTextFieldProps = React.ComponentProps<typeof TextField> & {
  name: string
  options?: any[]
  optionId?: (o: any) => string
}

const FormTextField: React.FC<FormTextFieldProps> = props => {
  const { name, options, optionId, children, ...nativeProps } = props
  const { inputProps, selectProps, errors } = React.useContext(Form.Context)
  const type = nativeProps.type
  const error = errors[name]
  const isSelect = nativeProps.select
  const textfieldPropsObject = isSelect ? selectProps(name, options!, optionId) : inputProps(name, type ? { type } : undefined)

  return (
    <TextField {...nativeProps} {...textfieldPropsObject as any} error={!!error} helperText={error ? error : nativeProps.helperText}>
      {children}
    </TextField>
  )
}

export default React.memo(FormTextField)
